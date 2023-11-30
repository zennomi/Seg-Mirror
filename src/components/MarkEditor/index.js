import * as React from "react";

export const MaskEditorDefaults = {
    cursorSize: 50,
    maskOpacity: .75,
    maskColor: "#23272d",
    maskBlendMode: "normal",
}

export const MaskEditor = (props) => {
    const src = props.src;
    const cursorSize = props.cursorSize ?? MaskEditorDefaults.cursorSize;
    const maskColor = props.maskColor ?? MaskEditorDefaults.maskColor;
    const maskBlendMode = props.maskBlendMode ?? MaskEditorDefaults.maskBlendMode;
    const maskOpacity = props.maskOpacity ?? MaskEditorDefaults.maskOpacity;


    const canvas = React.useRef(null);
    const maskCanvas = React.useRef(null);
    const cursorCanvas = React.useRef(null);
    const [context, setContext] = React.useState(null);
    const [maskContext, setMaskContext] = React.useState(null);
    const [cursorContext, setCursorContext] = React.useState(null);
    const [size, setSize] = React.useState({ x: 0, y: 0 })

    React.useLayoutEffect(() => {
        if (canvas.current && !context) {
            const ctx = (canvas.current).getContext("2d");
            setContext(ctx);
        }
    }, [canvas, context]);

    React.useLayoutEffect(() => {
        if (maskCanvas.current && !context) {
            const ctx = (maskCanvas.current).getContext("2d");
            if (ctx) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, size.x, size.y);
            }
            setMaskContext(ctx);
        }
    }, [maskCanvas, canvas]);

    React.useLayoutEffect(() => {
        if (cursorCanvas.current && !context) {
            const ctx = (cursorCanvas.current).getContext("2d");
            setCursorContext(ctx);
        }
    }, [cursorCanvas]);

    React.useEffect(() => {
        const image = new Image()

        image.onload = function () {
            if (!canvas.current) return

            const ctx = canvas.current.getContext('2d')

            if (!ctx || !image) return;

            setSize({ x: image.width, y: image.height })

            canvas.current.width = image.width
            canvas.current.height = image.height

            maskCanvas.current.width = image.width
            maskCanvas.current.height = image.height

            cursorCanvas.current.width = image.width
            cursorCanvas.current.height = image.height

            ctx.drawImage(image, 0, 0)

        }

        image.src = src
    }, [src])

    // Pass mask canvas up
    React.useLayoutEffect(() => {
        if (props.canvasRef) {
            props.canvasRef.current = maskCanvas.current;
        }
    }, [maskCanvas.current]);

    React.useEffect(() => {
        const listener = (evt) => {
            if (cursorContext) {
                cursorContext.clearRect(0, 0, size.x, size.y);

                cursorContext.beginPath();
                cursorContext.fillStyle = `${maskColor}88`;
                cursorContext.strokeStyle = maskColor;
                cursorContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
                cursorContext.fill();
                cursorContext.stroke();
            }
            if (maskContext && evt.buttons > 0) {
                maskContext.beginPath();
                maskContext.fillStyle = (evt.buttons > 1 || evt.shiftKey) ? "#ffffff" : maskColor;
                maskContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
                maskContext.fill();
            }
        }
        const scrollListener = (evt) => {
            if (cursorContext) {
                props.onCursorSizeChange(Math.max(0, cursorSize + (evt.deltaY > 0 ? 1 : -1)));

                cursorContext.clearRect(0, 0, size.x, size.y);

                cursorContext.beginPath();
                cursorContext.fillStyle = `${maskColor}88`;
                cursorContext.strokeStyle = maskColor;
                cursorContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
                cursorContext.fill();
                cursorContext.stroke();

                evt.stopPropagation();
                evt.preventDefault();
            }
        }

        cursorCanvas.current?.addEventListener("mousemove", listener);
        if (props.onCursorSizeChange) {
            cursorCanvas.current?.addEventListener("wheel", scrollListener);
        }
        return () => {
            cursorCanvas.current?.removeEventListener("mousemove", listener);
            if (props.onCursorSizeChange) {
                cursorCanvas.current?.removeEventListener("wheel", scrollListener);
            }
        }
    }, [cursorContext, maskContext, cursorCanvas, cursorSize, maskColor, size]);

    const replaceMaskColor = React.useCallback((hexColor, invert) => {
        const imageData = maskContext?.getImageData(0, 0, size.x, size.y);
        const color = hexToRgb(hexColor);
        if (imageData) {
            for (var i = 0; i < imageData?.data.length; i += 4) {
                const pixelColor = ((imageData.data[i] === 255) != invert) ? [255, 255, 255] : color;
                imageData.data[i] = pixelColor[0];
                imageData.data[i + 1] = pixelColor[1];
                imageData.data[i + 2] = pixelColor[2];
                imageData.data[i + 3] = imageData.data[i + 3];
            }
            maskContext?.putImageData(imageData, 0, 0);
        }
    }, [maskContext]);


    React.useEffect(() => replaceMaskColor(maskColor, false), [maskColor]);

    return <div className="react-mask-editor-outer mx-auto max-w-full max-h-[80vh]">
        <div
            className="react-mask-editor-inner mx-auto max-w-full"
            style={{
                width: size.x,
                height: size.y,
            }}
        >
            <canvas
                ref={canvas}
                className="react-mask-editor-base-canvas"
            />
            <canvas
                ref={maskCanvas}
                style={{
                    opacity: maskOpacity,
                    mixBlendMode: maskBlendMode,
                }}
                className="react-mask-editor-mask-canvas"
            />
            <canvas
                ref={cursorCanvas}
                className="react-mask-editor-cursor-canvas"
            />
        </div>
    </div>
}

export const hexToRgb = (color) => {
    var parts = color.replace("#", "").match(/.{1,2}/g);
    return parts.map(part => parseInt(part, 16));
}

export const toMask = (canvas) => {
    const ctx = canvas.getContext("2d");
    const size = {
        x: canvas.width,
        y: canvas.height,
    }
    const imageData = ctx?.getImageData(0, 0, size.x, size.y);
    const origData = Uint8ClampedArray.from(imageData.data);
    if (imageData) {
        for (var i = 0; i < imageData?.data.length; i += 4) {
            const pixelColor = (imageData.data[i] === 255) ? [255, 255, 255] : [0, 0, 0];
            imageData.data[i] = pixelColor[0];
            imageData.data[i + 1] = pixelColor[1];
            imageData.data[i + 2] = pixelColor[2];
            imageData.data[i + 3] = 255;
        }
        ctx?.putImageData(imageData, 0, 0);
    }

    const dataUrl = canvas.toDataURL();
    for (var i = 0; i < imageData?.data.length; i++) {
        imageData.data[i] = origData[i];
    }
    ctx.putImageData(imageData, 0, 0);

    return dataUrl;
}