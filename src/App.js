import React, { useState, useRef } from 'react';
import { Upload, Grid, ZoomIn, ZoomOut, Dice6 } from 'lucide-react';

const RandomGridPicker = () => {

    const gridDimensionMin = 50;
    const gridDimensionMax = 200;

    const [image, setImage] = useState(null);
    const [gridSize, setGridSize] = useState(50); // pixels per grid cell
    const [selectedCell, setSelectedCell] = useState(null);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const drawGrid = () => {
        if (!image || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size to match image
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw image
        ctx.drawImage(image, 0, 0);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw cell labels
        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        ctx.textBaseline = 'top';

        let row = 0;
        for (let y = 0; y < canvas.height; y += gridSize) {
            let col = 0;
            for (let x = 0; x < canvas.width; x += gridSize) {
                const label = `${String.fromCharCode(65 + row)}${col + 1}`;
                ctx.fillText(label, x + 2, y + 2);
                col++;
            }
            row++;
        }

        // Highlight selected cell if exists
        if (selectedCell) {
            const { row, col } = selectedCell;
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.strokeRect(
                col * gridSize,
                row * gridSize,
                gridSize,
                gridSize
            );
        }
    };

    const pickRandom = () => {
        if (!image) return;

        const rows = Math.floor(image.height / gridSize);
        const cols = Math.floor(image.width / gridSize);

        const randomRow = Math.floor(Math.random() * rows);
        const randomCol = Math.floor(Math.random() * cols);

        setSelectedCell({ row: randomRow, col: randomCol });
    };

    // Redraw when image, gridSize, or selectedCell changes
    React.useEffect(() => {
        drawGrid();
    }, [image, gridSize, selectedCell]);

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
                    <Upload size={20} />
                    Upload Image
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                </label>

                {/* Swapped which buttons do what relative to original Claude output:
                Now ZoomOut (-) makes the grid smaller, and ZoomIn (+) makes the grid larger */}
                <button
                    onClick={() => setGridSize(prev => Math.max(prev - 10, gridDimensionMin))}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={!image}
                >
                    <ZoomOut size={20} />
                </button>

                <button
                    onClick={() => setGridSize(prev => Math.min(prev + 10, gridDimensionMax))}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={!image}
                >
                    <ZoomIn size={20} />
                </button>

                <button
                    onClick={pickRandom}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    disabled={!image}
                >
                    <Dice6 size={20} />
                    Pick Random
                </button>
            </div>

            <div className="relative border border-gray-300 rounded overflow-hidden">
                {image ? (
                    <canvas
                        ref={canvasRef}
                        className="max-w-full h-auto"
                    />
                ) : (
                    <div className="w-96 h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                        Upload an image to begin
                    </div>
                )}
            </div>

            {selectedCell && (
                <div className="text-lg">
                    Selected: {String.fromCharCode(65 + selectedCell.row)}{selectedCell.col + 1}
                </div>
            )}
        </div>
    );
};

export default RandomGridPicker;