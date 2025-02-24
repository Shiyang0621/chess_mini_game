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
        
        // 具体走法规则
        switch (piece.type) {
            case '車':
                return this.canMoveRook(piece, toX, toY);
            case '馬':
                return this.canMoveKnight(piece, toX, toY);
            case '象':
            case '相':
                return this.canMoveElephant(piece, toX, toY);
            case '士':
            case '仕':
                return this.canMoveAdvisor(piece, toX, toY);
            case '將':
            case '帥':
                return this.canMoveGeneral(piece, toX, toY);
            case '炮':
                return this.canMoveCannon(piece, toX, toY);
            case '卒':
            case '兵':
                return this.canMovePawn(piece, toX, toY);
            default:
                return false;
        }
    }

    // Example rule implementations
    canMoveRook(piece, toX, toY) {
        // Rook moves in straight lines
        if (piece.x !== toX && piece.y !== toY) return false;
        // Check if path is clear
        return this.isPathClear(piece, toX, toY);
    }

    canMoveKnight(piece, toX, toY) {
        // Knight moves in an L shape
        const dx = Math.abs(piece.x - toX);
        const dy = Math.abs(piece.y - toY);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
    }

    canMoveElephant(piece, toX, toY) {
        // Elephant moves diagonally by 2 spaces and cannot cross the river
        const dx = Math.abs(piece.x - toX);
        const dy = Math.abs(piece.y - toY);
        if (dx !== 2 || dy !== 2) return false;
        const midX = (piece.x + toX) / 2;
        const midY = (piece.y + toY) / 2;
        // Check if path is blocked
        if (this.getPieceAt(midX, midY)) return false;
        // Check river crossing
        return piece.color === 'red' ? toY >= 5 : toY <= 4;
    }

    canMoveAdvisor(piece, toX, toY) {
        // Advisor moves diagonally by 1 space and stays within the palace
        const dx = Math.abs(piece.x - toX);
        const dy = Math.abs(piece.y - toY);
        if (dx !== 1 || dy !== 1) return false;
        return toX >= 3 && toX <= 5 && (piece.color === 'red' ? toY >= 7 : toY <= 2);
    }

    canMoveGeneral(piece, toX, toY) {
        // General moves 1 space orthogonally and stays within the palace
        const dx = Math.abs(piece.x - toX);
        const dy = Math.abs(piece.y - toY);
        if (dx + dy !== 1) return false;
        return toX >= 3 && toX <= 5 && (piece.color === 'red' ? toY >= 7 : toY <= 2);
    }

    canMoveCannon(piece, toX, toY) {
        // Cannon moves like a rook but captures by jumping over exactly one piece
        if (piece.x !== toX && piece.y !== toY) return false;
        const pathClear = this.isPathClear(piece, toX, toY);
        const targetPiece = this.getPieceAt(toX, toY);
        if (!targetPiece) return pathClear;
        return !pathClear && this.countPiecesInPath(piece, toX, toY) === 1;
    }

    canMovePawn(piece, toX, toY) {
        // Pawn moves forward 1 space, can move sideways after crossing the river
        const dx = Math.abs(piece.x - toX);
        const dy = piece.color === 'red' ? piece.y - toY : toY - piece.y;
        if (dy === 1 && dx === 0) return true; // Forward move
        if (dy === 0 && dx === 1) { // Sideways move
            return piece.color === 'red' ? piece.y < 5 : piece.y > 4;
        }
        return false;
    }

    // Helper methods
    isPathClear(piece, toX, toY) {
        // Check if path is clear for straight-line movement
        if (piece.x === toX) {
            const [start, end] = piece.y < toY ? [piece.y + 1, toY] : [toY + 1, piece.y];
            for (let y = start; y < end; y++) {
                if (this.getPieceAt(toX, y)) return false;
            }
        } else if (piece.y === toY) {
            const [start, end] = piece.x < toX ? [piece.x + 1, toX] : [toX + 1, piece.x];
            for (let x = start; x < end; x++) {
                if (this.getPieceAt(x, toY)) return false;
            }
        }
        return true;
    }

    countPiecesInPath(piece, toX, toY) {
        // Count the number of pieces in the path for cannon movement
        let count = 0;
        if (piece.x === toX) {
            const [start, end] = piece.y < toY ? [piece.y + 1, toY] : [toY + 1, piece.y];
            for (let y = start; y < end; y++) {
                if (this.getPieceAt(toX, y)) count++;
            }
        } else if (piece.y === toY) {
            const [start, end] = piece.x < toX ? [piece.x + 1, toX] : [toX + 1, piece.x];
            for (let x = start; x < end; x++) {
                if (this.getPieceAt(x, toY)) count++;
            }
        }
        return count;
    }

    movePiece(piece, toX, toY) {
        // 移除目标位置的棋子（吃子）
        const targetPiece = this.getPieceAt(toX, toY);
        if (targetPiece) {
            this.capturePiece(targetPiece);
            this.checkWinCondition(); // Check win condition immediately after capture
        }
        
        // 移动选中的棋子
        const pieceArray = piece.color === 'red' ? this.pieces.red : this.pieces.black;
        const movingPiece = pieceArray.find(p => p.x === piece.x && p.y === piece.y);
        if (movingPiece) {
            movingPiece.x = toX;
            movingPiece.y = toY;
        }
    }

    capturePiece(piece) {
        // Add animation for capturing a piece
        const pieceArray = piece.color === 'red' ? this.pieces.red : this.pieces.black;
        const index = pieceArray.findIndex(p => p.x === piece.x && p.y === piece.y);
        if (index !== -1) {
            // Remove piece immediately for win check
            pieceArray.splice(index, 1);
            
            // Simple fade-out animation
            const capturedPiece = piece;
            let opacity = 1;
            const fadeOut = setInterval(() => {
                opacity -= 0.1;
                this.ctx.globalAlpha = opacity;
                this.drawPiece(capturedPiece, piece.color === 'red' ? '#ff0000' : '#000000');
                if (opacity <= 0) {
                    clearInterval(fadeOut);
                    this.ctx.globalAlpha = 1;
                    this.board.drawBoard();
                    this.checkWinCondition(); // Check win condition after animation
                }
            }, 50);
        }
    }

    checkWinCondition() {
        const redGeneral = this.pieces.red.find(p => p.type === '帥');
        const blackGeneral = this.pieces.black.find(p => p.type === '將');
        if (!redGeneral) {
            this.showWinMessage('黑方赢了!');
            this.endGame();
        } else if (!blackGeneral) {
            this.showWinMessage('红方赢了!');
            this.endGame();
        }
    }

    showWinMessage(message) {
        const modal = document.getElementById('winModal');
        const winMessage = document.getElementById('winMessage');
        winMessage.textContent = message;
        modal.style.display = 'block';
    }

    endGame() {
        // Disable further moves or interactions
        this.board.canvas.removeEventListener('click', this.handleClick);
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
                { type: '車', x: 0, y: 9 },
                { type: '馬', x: 1, y: 9 },
                { type: '相', x: 2, y: 9 },
                { type: '仕', x: 3, y: 9 },
                { type: '帥', x: 4, y: 9 },
                { type: '仕', x: 5, y: 9 },
                { type: '相', x: 6, y: 9 },
                { type: '馬', x: 7, y: 9 },
                { type: '車', x: 8, y: 9 },
                { type: '炮', x: 1, y: 7 },
                { type: '炮', x: 7, y: 7 },
                { type: '兵', x: 0, y: 6 },
                { type: '兵', x: 2, y: 6 },
                { type: '兵', x: 4, y: 6 },
                { type: '兵', x: 6, y: 6 },
                { type: '兵', x: 8, y: 6 }
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

// Global function to close the modal
function closeModal() {
    const modal = document.getElementById('winModal');
    modal.style.display = 'none';
} 