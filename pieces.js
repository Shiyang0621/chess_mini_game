window.ChessPieces = class ChessPieces {
    constructor(board) {
        this.board = board;
        this.ctx = board.ctx;
        this.startX = board.startX;
        this.startY = board.startY;
        this.cellSize = board.cellSize;
        this.pieces = this.initPieces();
        
        // 添加游戏状态
        this.selectedPiece = null;
        this.currentPlayer = 'red';  // 红方先手
        this.playerDisplay = document.querySelector('.current-player');
        this.updatePlayerDisplay();
        
        // 添加事件监听
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.board.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    updatePlayerDisplay() {
        if (this.playerDisplay) {
            this.playerDisplay.textContent = this.currentPlayer === 'red' ? '红方' : '黑方';
            this.playerDisplay.className = 'current-player ' + this.currentPlayer;
        }
    }

    handleClick(e) {
        const rect = this.board.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 转换为棋盘坐标
        const boardX = Math.round((x - this.startX) / this.cellSize);
        const boardY = Math.round((y - this.startY) / this.cellSize);
        
        // 处理点击
        if (this.selectedPiece) {
            // 已选中棋子，尝试移动
            if (this.canMove(this.selectedPiece, boardX, boardY)) {
                this.movePiece(this.selectedPiece, boardX, boardY);
                this.selectedPiece = null;
                // 切换玩家并更新显示
                this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                this.updatePlayerDisplay();
            } else {
                // 如果点击的是同色棋子，更换选中
                const clickedPiece = this.getPieceAt(boardX, boardY);
                if (clickedPiece && clickedPiece.color === this.currentPlayer) {
                    this.selectedPiece = clickedPiece;
                } else {
                    this.selectedPiece = null;
                }
            }
        } else {
            // 选中新棋子
            const piece = this.getPieceAt(boardX, boardY);
            if (piece && piece.color === this.currentPlayer) {
                this.selectedPiece = piece;
            }
        }
        
        // 重绘棋盘
        this.board.drawBoard();
    }

    getPieceAt(x, y) {
        const redPiece = this.pieces.red.find(p => p.x === x && p.y === y);
        const blackPiece = this.pieces.black.find(p => p.x === x && p.y === y);
        if (redPiece) return {...redPiece, color: 'red'};
        if (blackPiece) return {...blackPiece, color: 'black'};
        return null;
    }

    canMove(piece, toX, toY) {
        // 基本检查：是否在棋盘内
        if (toX < 0 || toX > 8 || toY < 0 || toY > 9) return false;
        
        // 检查目标位置是否有己方棋子
        const targetPiece = this.getPieceAt(toX, toY);
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        // TODO: 添加各种棋子的具体走法规则
        return true;
    }

    movePiece(piece, toX, toY) {
        // 移除目标位置的棋子（吃子）
        const targetPiece = this.getPieceAt(toX, toY);
        if (targetPiece) {
            const targetArray = targetPiece.color === 'red' ? this.pieces.red : this.pieces.black;
            const index = targetArray.findIndex(p => p.x === toX && p.y === toY);
            if (index !== -1) targetArray.splice(index, 1);
        }
        
        // 移动选中的棋子
        const pieceArray = piece.color === 'red' ? this.pieces.red : this.pieces.black;
        const movingPiece = pieceArray.find(p => p.x === piece.x && p.y === piece.y);
        if (movingPiece) {
            movingPiece.x = toX;
            movingPiece.y = toY;
        }
    }

    initPieces() {
        return {
            // 黑方（上方）
            black: [
                { type: '車', x: 0, y: 0 },
                { type: '馬', x: 1, y: 0 },
                { type: '象', x: 2, y: 0 },
                { type: '士', x: 3, y: 0 },
                { type: '將', x: 4, y: 0 },
                { type: '士', x: 5, y: 0 },
                { type: '象', x: 6, y: 0 },
                { type: '馬', x: 7, y: 0 },
                { type: '車', x: 8, y: 0 },
                { type: '炮', x: 1, y: 2 },
                { type: '炮', x: 7, y: 2 },
                { type: '卒', x: 0, y: 3 },
                { type: '卒', x: 2, y: 3 },
                { type: '卒', x: 4, y: 3 },
                { type: '卒', x: 6, y: 3 },
                { type: '卒', x: 8, y: 3 }
            ],
            // 红方（下方）
            red: [
                { type: '車', x: 0, y: 8 },
                { type: '馬', x: 1, y: 8 },
                { type: '相', x: 2, y: 8 },
                { type: '仕', x: 3, y: 8 },
                { type: '帥', x: 4, y: 8 },
                { type: '仕', x: 5, y: 8 },
                { type: '相', x: 6, y: 8 },
                { type: '馬', x: 7, y: 8 },
                { type: '車', x: 8, y: 8 },
                { type: '炮', x: 1, y: 6 },
                { type: '炮', x: 7, y: 6 },
                { type: '兵', x: 0, y: 5 },
                { type: '兵', x: 2, y: 5 },
                { type: '兵', x: 4, y: 5 },
                { type: '兵', x: 6, y: 5 },
                { type: '兵', x: 8, y: 5 }
            ]
        };
    }

    drawPiece(piece, color) {
        const x = this.startX + piece.x * this.cellSize;
        const y = this.startY + piece.y * this.cellSize;
        const radius = this.cellSize * 0.45;

        // 绘制棋子底色
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        
        // 如果是选中的棋子，绘制高亮效果
        if (this.selectedPiece && 
            this.selectedPiece.x === piece.x && 
            this.selectedPiece.y === piece.y) {
            this.ctx.strokeStyle = '#ff0';
            this.ctx.lineWidth = 3;
        } else {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
        }
        this.ctx.stroke();

        // 绘制文字
        this.ctx.font = `bold ${this.cellSize * 0.4}px SimHei`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(piece.type, x, y);
    }

    drawAllPieces() {
        // 绘制所有红方棋子
        this.pieces.red.forEach(piece => {
            this.drawPiece(piece, '#ff0000');
        });

        // 绘制所有黑方棋子
        this.pieces.black.forEach(piece => {
            this.drawPiece(piece, '#000000');
        });
    }
} 