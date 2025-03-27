import React, { useRef, useState, useEffect } from "react";
import styles from "./image-editor.module.scss";
import { IconButton } from "./button";
import { Modal } from "./ui-lib";
import ConfirmIcon from "../icons/confirm.svg";
import CancelIcon from "../icons/cancel.svg";
import ReturnIcon from "../icons/return.svg";
import Locale from "../locales";

// 添加工具类型枚举
enum DrawingTool {
  Brush = "brush",
  Line = "line",
  Arrow = "arrow",
  Rectangle = "rectangle",
  Circle = "circle",
  Eraser = "eraser",
}

// 添加翻转图标的样式封装组件
const FlippedIcon = ({ icon }: { icon: React.ReactNode }) => (
  <div style={{ transform: "scaleX(-1)" }}>{icon}</div>
);

export function ImageEditor(props: {
  imageUrl: string;
  onClose: () => void;
  onSave: (editedImageUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FF0000"); // 默认红色
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>(
    DrawingTool.Brush,
  );
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [prevBrushSize, setPrevBrushSize] = useState(5);

  // 初始化Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    setCtx(context);

    // 加载图片
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      // 调整canvas大小以适应图片
      canvas.width = image.width;
      canvas.height = image.height;

      // 绘制图片
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      // 保存原始图像
      setOriginalImage(image);

      // 保存初始状态到历史记录
      saveToHistory();
    };

    // 处理CORS问题
    image.src = props.imageUrl.replace(/^data:image\/[^;]+/, "data:image/png");
  }, [props.imageUrl]);

  // 保存当前状态到历史记录
  const saveToHistory = () => {
    if (!canvasRef.current) return;
    setHistory((prev) => [...prev, canvasRef.current!.toDataURL()]);
  };

  // 撤销功能
  const undo = () => {
    if (history.length <= 1) return;

    const newHistory = [...history];
    const lastState = newHistory.pop()!; // 移除当前状态

    // 添加到重做栈
    setRedoStack((prev) => [...prev, lastState]);

    // 恢复到上一个状态
    if (ctx && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height,
        );
        ctx.drawImage(img, 0, 0);
      };
      img.src = newHistory[newHistory.length - 1];
    }

    setHistory(newHistory);
  };

  // 重做功能
  const redo = () => {
    if (redoStack.length === 0) return;

    const newRedoStack = [...redoStack];
    const stateToRestore = newRedoStack.pop()!;

    // 将当前状态添加到历史
    setHistory((prev) => [...prev, stateToRestore]);

    // 恢复状态
    if (ctx && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height,
        );
        ctx.drawImage(img, 0, 0);
      };
      img.src = stateToRestore;
    }

    setRedoStack(newRedoStack);
  };

  // 开始绘制
  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!ctx || !canvasRef.current) return;
    setIsDrawing(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let x: number, y: number;
    if ("touches" in e) {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    // 对于形状工具，记录起始点
    if (
      selectedTool !== DrawingTool.Brush &&
      selectedTool !== DrawingTool.Eraser
    ) {
      setStartPoint({ x, y });
      // 保存当前状态用于预览
      setPreviewImage(canvasRef.current.toDataURL());
    } else {
      // 自由绘制模式或橡皮擦模式
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";

      if (selectedTool === DrawingTool.Eraser) {
        // 新版橡皮擦：通过绘制原始图像来"擦除"
        eraseAt(x, y, brushSize / 2);
      } else {
        // 画笔模式
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
      }
    }
  };

  // 添加专门的擦除函数
  const eraseAt = (x: number, y: number, radius: number) => {
    if (!ctx || !originalImage || !canvasRef.current) return;

    const lastDrawingState = history[history.length - 1];
    if (!lastDrawingState) return;

    // 保存当前状态
    ctx.save();

    // 创建圆形剪切区域（即橡皮擦形状）
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();

    // 从上一个历史状态中获取当前绘制
    const currentImg = new Image();
    currentImg.onload = () => {
      if (!ctx || !originalImage || !canvasRef.current) return;

      // 清除该区域
      ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2);

      // 在该区域绘制原始图像
      ctx.drawImage(
        originalImage,
        x - radius,
        y - radius,
        radius * 2,
        radius * 2,
        x - radius,
        y - radius,
        radius * 2,
        radius * 2,
      );

      // 恢复上下文状态
      ctx.restore();
    };
    currentImg.src = lastDrawingState;
  };

  // 绘制
  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let x: number, y: number;
    if ("touches" in e) {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    if (selectedTool === DrawingTool.Brush) {
      // 画笔模式
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (selectedTool === DrawingTool.Eraser) {
      // 橡皮擦模式 - 使用新的擦除函数
      eraseAt(x, y, brushSize / 2);
    } else if (startPoint && previewImage) {
      // 形状绘制模式 - 预览
      const img = new Image();
      img.onload = () => {
        ctx.globalCompositeOperation = "source-over"; // 重置为默认模式
        ctx.clearRect(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height,
        );
        ctx.drawImage(img, 0, 0);

        ctx.beginPath();
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = color;

        switch (selectedTool) {
          case DrawingTool.Line:
            drawLine(startPoint.x, startPoint.y, x, y);
            break;
          case DrawingTool.Arrow:
            drawArrow(startPoint.x, startPoint.y, x, y);
            break;
          case DrawingTool.Rectangle:
            drawRectangle(startPoint.x, startPoint.y, x, y);
            break;
          case DrawingTool.Circle:
            drawCircle(startPoint.x, startPoint.y, x, y);
            break;
        }
      };
      img.src = previewImage;
    }
  };

  // 结束绘制
  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (ctx) {
      ctx.closePath();
      ctx.globalCompositeOperation = "source-over"; // 重置为默认模式
    }

    // 重置状态
    setStartPoint(null);
    setPreviewImage(null);

    // 保存到历史记录并清空重做栈
    saveToHistory();
    setRedoStack([]);
  };

  // 保存编辑后的图片
  const saveEditedImage = () => {
    if (!canvasRef.current) return;
    const editedImageUrl = canvasRef.current.toDataURL("image/png");
    props.onSave(editedImageUrl);
    props.onClose();
  };

  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#FFFFFF",
  ];
  const sizes = [2, 5, 10, 20];

  // 添加绘制函数
  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const drawArrow = (x1: number, y1: number, x2: number, y2: number) => {
    if (!ctx) return;

    // 绘制直线部分
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 计算箭头
    const headlen = 15; // 箭头长度
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // 绘制箭头两边
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headlen * Math.cos(angle - Math.PI / 6),
      y2 - headlen * Math.sin(angle - Math.PI / 6),
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headlen * Math.cos(angle + Math.PI / 6),
      y2 - headlen * Math.sin(angle + Math.PI / 6),
    );
    ctx.stroke();
  };

  const drawRectangle = (x1: number, y1: number, x2: number, y2: number) => {
    if (!ctx) return;
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.beginPath();
    ctx.rect(x1, y1, width, height);
    ctx.stroke();
  };

  const drawCircle = (x1: number, y1: number, x2: number, y2: number) => {
    if (!ctx) return;
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  return (
    <div className="modal-mask">
      <Modal
        title="编辑图片"
        onClose={props.onClose}
        actions={[
          <IconButton
            key="undo"
            icon={<ReturnIcon />}
            bordered
            text="撤销"
            onClick={undo}
            disabled={history.length <= 1}
          />,
          <IconButton
            key="redo"
            icon={<FlippedIcon icon={<ReturnIcon />} />}
            bordered
            text="重做"
            onClick={redo}
            disabled={redoStack.length === 0}
          />,
          <IconButton
            key="cancel"
            icon={<CancelIcon />}
            bordered
            text={Locale.UI.Cancel}
            onClick={props.onClose}
          />,
          <IconButton
            key="save"
            icon={<ConfirmIcon />}
            bordered
            text={Locale.UI.Confirm}
            type="primary"
            onClick={saveEditedImage}
          />,
        ]}
      >
        <div className={styles["image-editor-container"]}>
          <div className={styles["tools-container"]}>
            <div className={styles["tools-selector"]}>
              <div
                className={`${styles["tool-option"]} ${
                  selectedTool === DrawingTool.Brush ? styles["selected"] : ""
                }`}
                onClick={() => {
                  if (selectedTool === DrawingTool.Eraser) {
                    setBrushSize(prevBrushSize);
                  }
                  setSelectedTool(DrawingTool.Brush);
                }}
                title="画笔工具"
              >
                ✏️
              </div>
              <div
                className={`${styles["tool-option"]} ${
                  selectedTool === DrawingTool.Eraser ? styles["selected"] : ""
                }`}
                onClick={() => {
                  if (selectedTool !== DrawingTool.Eraser) {
                    setPrevBrushSize(brushSize);
                  }
                  setSelectedTool(DrawingTool.Eraser);
                  setBrushSize(20); // 设置为最粗的笔刷粗细
                }}
                title="橡皮擦"
              >
                🧼
              </div>
              <div
                className={`${styles["tool-option"]} ${
                  selectedTool === DrawingTool.Line ? styles["selected"] : ""
                }`}
                onClick={() => {
                  if (selectedTool === DrawingTool.Eraser) {
                    setBrushSize(prevBrushSize);
                  }
                  setSelectedTool(DrawingTool.Line);
                }}
                title="直线工具"
              >
                ⁄
              </div>
              <div
                className={`${styles["tool-option"]} ${
                  selectedTool === DrawingTool.Arrow ? styles["selected"] : ""
                }`}
                onClick={() => {
                  if (selectedTool === DrawingTool.Eraser) {
                    setBrushSize(prevBrushSize);
                  }
                  setSelectedTool(DrawingTool.Arrow);
                }}
                title="箭头工具"
              >
                →
              </div>
              <div
                className={`${styles["tool-option"]} ${
                  selectedTool === DrawingTool.Rectangle
                    ? styles["selected"]
                    : ""
                }`}
                onClick={() => {
                  if (selectedTool === DrawingTool.Eraser) {
                    setBrushSize(prevBrushSize);
                  }
                  setSelectedTool(DrawingTool.Rectangle);
                }}
                title="矩形工具"
              >
                □
              </div>
              <div
                className={`${styles["tool-option"]} ${
                  selectedTool === DrawingTool.Circle ? styles["selected"] : ""
                }`}
                onClick={() => {
                  if (selectedTool === DrawingTool.Eraser) {
                    setBrushSize(prevBrushSize);
                  }
                  setSelectedTool(DrawingTool.Circle);
                }}
                title="圆形工具"
              >
                ○
              </div>
            </div>

            <div className={styles["color-picker"]}>
              {colors.map((c) => (
                <div
                  key={c}
                  className={`${styles["color-option"]} ${
                    color === c ? styles["selected"] : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>

            <div className={styles["brush-size-picker"]}>
              {sizes.map((s) => (
                <div
                  key={s}
                  className={`${styles["size-option"]} ${
                    brushSize === s ? styles["selected"] : ""
                  }`}
                  onClick={() => setBrushSize(s)}
                >
                  <div
                    style={{
                      width: s,
                      height: s,
                      borderRadius: "50%",
                      backgroundColor: "black",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className={styles["canvas-container"]}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              className={styles["editor-canvas"]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
