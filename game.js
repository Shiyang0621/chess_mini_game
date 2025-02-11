class ChineseChess {
    constructor() {
        this.canvas = document.getElementById('chessboard');
        this.ctx = this.canvas.getContext('2d');
        this.init();
        this.piecesManager = new ChessPieces(this);
    }

    init() {
        // 将格子尺寸从 152px 调小到 80px
        this.cellSize = 80;
        
        this.boardWidth = this.cellSize * 8;
        this.boardHeight = this.cellSize * 8;
        
        // 相应调小画布边距
        this.canvas.width = this.boardWidth + 100;
        this.canvas.height = this.boardHeight + 100;
        
        this.startX = (this.canvas.width - this.boardWidth) / 2;
        this.startY = (this.canvas.height - this.boardHeight) / 2;
        
        this.lineWidth = 1;  // 线条也适当调细
        this.crossSize = 5;  // 十字也调小
        
        this.drawBoard();
    }

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 设置背景色为浅色
        this.ctx.fillStyle = '#E8C19C';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 设置线条为深色
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = this.lineWidth;

        this.drawGrid();
        this.drawEdgeCrosses();
        this.drawRiver();
        this.drawPalaceLines();

        console.log('Drawing board...');
        console.log('Board dimensions:', this.boardWidth, this.boardHeight);
        console.log('Cell size:', this.cellSize);
        console.log('Start position:', this.startX, this.startY);
        
        if (!this.piecesManager) {
            console.log('Creating new PiecesManager');
            this.piecesManager = new ChessPieces(this);
        }
        console.log('Drawing pieces...');
        this.piecesManager.drawAllPieces();
    }

    drawGrid() {
        // 垂直线
        for (let i = 0; i <= 8; i++) {
            const x = this.startX + i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.startY);
            this.ctx.lineTo(x, this.startY + this.boardHeight);
            this.ctx.stroke();
        }

        // 水平线，改为8条
        for (let i = 0; i <= 8; i++) {
            const y = this.startY + i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, y);
            this.ctx.lineTo(this.startX + this.boardWidth, y);
            this.ctx.stroke();
        }
    }

    drawEdgeCrosses() {
        for (let i = 0; i <= 8; i++) {
            for (let j = 0; j <= 8; j++) {  // 改为8
                const x = this.startX + i * this.cellSize;
                const y = this.startY + j * this.cellSize;
                
                if (i === 0 || i === 8 || j === 0 || j === 8) {
                    if (i === 0) {
                        this.drawLine(x - this.crossSize, y, x, y);
                    }
                    if (i === 8) {
                        this.drawLine(x, y, x + this.crossSize, y);
                    }
                    if (j === 0) {
                        this.drawLine(x, y - this.crossSize, x, y);
                    }
                    if (j === 8) {
                        this.drawLine(x, y, x, y + this.crossSize);
                    }
                }
            }
        }
    }

    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    drawRiver() {
        // 河界区域
        const riverY = this.startY + 4 * this.cellSize - 15;
        const riverHeight = 30;
        
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(
            this.startX,
            riverY,
            this.boardWidth,
            riverHeight
        );

        // 文字
        this.ctx.font = '20px SimHei';
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerY = riverY + riverHeight / 2;
        const spacing = this.cellSize * 2;
        
        this.ctx.fillText('楚', this.startX + 2 * this.cellSize, centerY);
        this.ctx.fillText('河', this.startX + 3 * this.cellSize, centerY);
        this.ctx.fillText('漢', this.startX + 5 * this.cellSize, centerY);
        this.ctx.fillText('界', this.startX + 6 * this.cellSize, centerY);
    }

    drawPalaceLines() {
        // 上宫斜线
        this.drawPalaceX(3, 0);
        // 下宫斜线
        this.drawPalaceX(3, 6);
    }

    drawPalaceX(startCol, startRow) {
        // 精确计算2x2格子的四个角的位置
        const x1 = Math.round(this.startX + startCol * this.cellSize);
        const y1 = Math.round(this.startY + startRow * this.cellSize);
        const x2 = Math.round(this.startX + (startCol + 2) * this.cellSize);
        const y2 = Math.round(this.startY + (startRow + 2) * this.cellSize);

        this.ctx.lineWidth = 1;

        // 使用 save() 和 restore() 来确保裁剪区域只影响斜线
        this.ctx.save();
        
        // 创建2x2格子大小的裁剪区域
        this.ctx.beginPath();
        this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
        this.ctx.clip();

        // 在裁剪区域内画斜线
        // 第一条斜线（左上到右下）
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // 第二条斜线（右上到左下）
        this.ctx.beginPath();
        this.ctx.moveTo(x2, y1);
        this.ctx.lineTo(x1, y2);
        this.ctx.stroke();

        // 恢复画布状态
        this.ctx.restore();
    }

    reset() {
        // 重置游戏状态
        this.init();
        // 重新创建棋子管理器
        this.piecesManager = new ChessPieces(this);
        // 重置当前玩家为红方
        this.piecesManager.currentPlayer = 'red';
        this.piecesManager.updatePlayerDisplay();
    }
}

// 初始化游戏
const game = new ChineseChess(); 