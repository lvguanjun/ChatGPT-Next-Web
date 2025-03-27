import { useState, useRef, useEffect } from "react";
import { IconButton } from "./button";
import { testModels, ModelTestResult } from "../utils/model-test";
import { useAccessStore } from "../store";
import { showToast } from "./ui-lib";
import Locale from "../locales";

// 在组件外部定义一个sleep函数
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function ModelTestButton(props: {
  models: string[];
  onTestComplete?: (results: Record<string, ModelTestResult>) => void;
  onModelTested?: (
    modelId: string,
    result: ModelTestResult,
    allResults?: Record<string, ModelTestResult>,
  ) => void;
  onTimeoutChange?: (timeout: number) => void;
  initialTimeout?: number;
  useServerTest?: boolean;
}) {
  const [testing, setTesting] = useState(false);
  const [timeout, setTimeout] = useState(props.initialTimeout || 5);
  const accessStore = useAccessStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (props.onTimeoutChange) {
      props.onTimeoutChange(timeout);
    }
  }, [timeout, props.onTimeoutChange]);

  const handleTest = async () => {
    // 如果正在测试中，则停止测试
    if (testing) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setTesting(false);
      showToast(Locale.Settings.Access.CustomModel.TestStopped);
      return;
    }

    // 只在使用客户端测试时才检查API密钥
    if (!props.useServerTest && !accessStore.openaiApiKey) {
      showToast(Locale.Settings.Access.CustomModel.ApiKeyRequired);
      return;
    }

    setTesting(true);
    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 获取要测试的模型列表
      const modelsToTest = props.models;

      if (modelsToTest.length === 0) {
        showToast(Locale.Settings.Access.CustomModel.NoModelsToTest);
        setTesting(false);
        return;
      }

      let results: Record<string, ModelTestResult> = {};

      if (props.useServerTest) {
        // 使用服务端测试
        try {
          // 显示开始测试的提示消息
          showToast(
            Locale.Settings.Access.CustomModel.TestAllModelsStart.replace(
              "{0}",
              modelsToTest.length.toString(),
            ),
          );

          // 创建一个本地变量来跟踪最新的测试结果
          const testResults: Record<string, ModelTestResult> = {};

          // 逐个测试模型
          for (const modelId of modelsToTest) {
            // 检查是否已取消
            if (abortControllerRef.current?.signal.aborted) break;

            // 发送单个模型的测试请求
            const response = await fetch("/api/model-test", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                models: [modelId],
                timeoutSeconds: timeout,
              }),
              signal: abortControllerRef.current?.signal,
            });

            if (!response.ok) {
              throw new Error(`服务端测试失败: ${response.status}`);
            }

            const data = await response.json();
            const result = data.results[modelId];

            // 保存结果
            results[modelId] = result;
            testResults[modelId] = result;

            // 显示测试结果消息
            if (result) {
              if (result.success) {
                showToast(
                  Locale.Settings.Access.CustomModel.TestSuccessMessage.replace(
                    "{0}",
                    modelId,
                  ).replace(
                    "{1}",
                    ((result.responseTime || 0) / 1000).toFixed(2),
                  ),
                );
              } else if (result.timeout) {
                showToast(
                  Locale.Settings.Access.CustomModel.TestTimeoutMessage.replace(
                    "{0}",
                    modelId,
                  ),
                );
              } else {
                const errorMessage =
                  result.message ||
                  Locale.Settings.Access.CustomModel.DefaultTestFailedMessage;
                showToast(
                  Locale.Settings.Access.CustomModel.TestErrorMessage.replace(
                    "{0}",
                    modelId,
                  ).replace("{1}", errorMessage),
                );
              }

              // 使用函数式更新确保基于最新状态
              if (props.onModelTested) {
                props.onModelTested(modelId, result, testResults);
              }

              // 添加短暂延迟
              await sleep(10);
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            // 忽略中止错误
          } else {
            throw error;
          }
        }
      } else {
        // 使用客户端测试
        const baseUrl = accessStore.openaiUrl || "https://api.openai.com";
        results = await testModels(
          modelsToTest,
          accessStore.openaiApiKey,
          baseUrl,
          timeout,
          true,
          abortControllerRef.current?.signal,
          props.onModelTested,
        );
      }

      // 调用回调函数
      if (
        props.onTestComplete &&
        abortControllerRef.current &&
        !abortControllerRef.current.signal.aborted
      ) {
        props.onTestComplete(results);
      }

      // 显示测试完成提示
      if (
        abortControllerRef.current &&
        !abortControllerRef.current.signal.aborted
      ) {
        const successCount = Object.values(results).filter(
          (r) => r.success,
        ).length;
        showToast(
          Locale.Settings.Access.CustomModel.TestCompleteMessage.replace(
            "{0}",
            successCount.toString(),
          ).replace("{1}", modelsToTest.length.toString()),
        );
      }
    } catch (error) {
      // 忽略 AbortError
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("测试模型时出错:", error);
        showToast(
          Locale.Settings.Access.CustomModel.TestErrorPrefix +
            (error instanceof Error ? error.message : String(error)),
        );
      }
    } finally {
      setTesting(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <select
        value={timeout}
        onChange={(e) => setTimeout(Number(e.target.value))}
        style={{
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "12px",
          height: "28px",
        }}
      >
        <option value="5">
          {Locale.Settings.Access.CustomModel.TimeoutOptions.FiveSeconds}
        </option>
        <option value="6">
          {Locale.Settings.Access.CustomModel.TimeoutOptions.SixSeconds}
        </option>
        <option value="7">
          {Locale.Settings.Access.CustomModel.TimeoutOptions.SevenSeconds}
        </option>
        <option value="8">
          {Locale.Settings.Access.CustomModel.TimeoutOptions.EightSeconds}
        </option>
        <option value="9">
          {Locale.Settings.Access.CustomModel.TimeoutOptions.NineSeconds}
        </option>
        <option value="10">
          {Locale.Settings.Access.CustomModel.TimeoutOptions.TenSeconds}
        </option>
      </select>
      <IconButton
        icon={undefined}
        text={
          testing
            ? Locale.Settings.Access.CustomModel.StopTest
            : Locale.Settings.Access.CustomModel.TestAll
        }
        onClick={handleTest}
        bordered
        disabled={false}
      />
    </div>
  );
}
