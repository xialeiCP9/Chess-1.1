/**
 * 处理棋子移动
 */
(function(){
	var Position = window.Position = function(){
		//判断 “将” 是否在九宫格内的辅助数组
		this.IN_FORT_ = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		];
		this.KING_DELTA = [-16,-1,1,16]; //将
	 	this.ADVISOR_DELTA = [-17,-15,15,17];//士 ， 象棋为 *2
		this.KNIGHT_DELTA = [[-33,-31],[-18,14],[-14,18],[31,33]] //马，对应的马脚为 KING_DELTA
		this.init();
	}
	Position.prototype.init = function(){
		//走法数组
		this.mvList = [0];
		//吃子数组
		this.pcList = [0];
		//已下棋步骤
		this.step = 0;
	}
	//棋子的每次移动，都可以视为一个整数
	Position.prototype.move = function(sqSrc,sqDst){
		return sqSrc + (sqDst << 8);
	}
	//根据步骤，可以获得起点
	Position.prototype.getSqSrc = function(mv){
		return (mv & 255);
	}
	//根据步骤，获取终点
	Position.prototype.getSqDst = function(mv){
		return (mv >> 8);
	}
	//尝试走一步棋,mv 走法  squares 棋盘数组
	Position.prototype.makeMove = function(mv,squares){
		this.movePiece(mv,squares);
		this.changeSide();
		this.step++;
		return true;
	}
	//取消该走法
	Position.prototype.undoMakeMove = function(squares){
		this.step--;
		this.undoMovePiece(squares);
		this.changeSide();
	}
	//移动棋子
	Position.prototype.movePiece = function(mv,squares){
		var sqSrc = this.getSqSrc(mv);
		var sqDst = this.getSqDst(mv);
		var pcSrc = squares[sqSrc],pcDst = squares[sqDst];
		//将终点棋子放入吃子数组
		this.pcList.push(pcDst);
		//将终点替换成起点的棋子
		squares[sqDst] = pcSrc;
		//将起点替换成空子
		squares[sqSrc] = 0;
		//将走法记录到走法数组中
		this.mvList.push(mv);
	}
	//取消棋子移动
	Position.prototype.undoMovePiece = function(squares){
		//取出最近一次的走法
		var mv = this.mvList.pop();
		//根据走法获得起点、终点，以及对应的棋子
		var sqSrc = this.getSqSrc(sqSrc);
		var sqDst = this.getSqDst(sqDst);
		var pcDst = squares[sqDst];

		//取出最后一次吃子
		var pc = this.pcList.pop();
		//将最后一次吃子放到终点，原终点棋子放到起点
		squares[sqDst] = pc;
		squares[sqSrc] = pcDst;
	}
	//更改执子方
	Position.prototype.changeSide = function(){
		game.board.sdPlayer = 1 - game.board.sdPlayer;
	}
	//判断棋子走法是否合法
	Position.prototype.isLegalMove = function(mv){
		//获取该走法的起点和终点
		var sqSrc = this.getSqSrc(mv);
		var sqDst = this.getSqDst(mv);
		//获取起点棋子，终点棋子
		var pcSrc = game.board.squares[sqSrc];
		var pcDst = game.board.squares[sqDst];
		//获取本方的红黑标记
		var pcSelfSide = game.board.sideFlag(game.board.sdPlayer);
		//如果起点不是本方棋子,或者终点为本方棋子
		if((pcSrc & pcSelfSide) == 0 || (pcDst & pcSelfSide) != 0){
			return false;
		}
		//根据起点棋子，判断是否合法
		switch(pcSrc - pcSelfSide){
			case game.board.PIECE_KING: //将
				return this.inFort(sqDst) && this.isLegalKingMove(sqSrc,sqDst);
			case game.board.PIECE_ADVISOR: //士
				return this.inFort(sqDst) && this.isLegalAdvisorMove(sqSrc,sqDst);
			case game.board.PIECE_BISHOP: //象
				return this.sameHalf(sqSrc,sqDst) && this.isLegalBishopMove(sqSrc,sqDst) 
					&& game.board.squares[this.bishopEye(sqSrc,sqDst)] == 0;
			case game.board.PIECE_KNIGHT: //马
				var knightLeg = this.knightLeg(sqSrc,sqDst);
				//走日字，且马腿为空子
				return knightLeg != sqSrc && game.board.squares[knightLeg] == 0;
			case game.board.PIECE_ROOK:
			case game.board.PIECE_CANNON: //车、炮
				var delta;//方向向量
				//判断起点和终点是不是同一行 
				if(this.sameRow(sqSrc,sqDst)){
					delta = (sqSrc < sqDst) ? 1 : -1;
				} else if (this.sameCol(sqSrc,sqDst)){//判断起点和终点是不是同一列
					delta = (sqSrc < sqDst) ? 16 : -16;
				} else {
					return false;
				}
				//沿着方向尝试走一步，直到该处有棋子为止，或者走到了终点
				var sq = sqSrc + delta;
				while(game.board.squares[sq] == 0 && sq != sqDst){
					sq += delta;
				}
				//如果此时走到了终点，且终点棋子为空子或者对方棋子，则车的走法符合;如果是空子，则两者都符合
				if(sq == sqDst){
					return game.board.squares[sq] == 0 || pcSrc - pcSelfSide == game.board.PIECE_ROOK;
				}
				//如果不为终点，则说明棋子翻山，若棋子为车，则必定不合法；若为炮，且终点棋子为空，也不合法
				if(pcDst == 0 || pcSrc - pcSelfSide == game.board.PIECE_ROOK){
					return false;
				}
				//棋子为炮，且终点为对方棋子，那么就要判断接下来前进时有没有遇到棋子
				sq += delta;
				while(game.board.squares[sq] == 0 && sq != sqDst){
					sq += delta;
				}
				return sq == sqDst;
			case game.board.PIECE_PAWN: //兵
				//兵过河后，可以前进、左右移动
				if(this.awayRiver(sqSrc,game.board.sdPlayer) && (sqDst == sqSrc + 1 || sqDst == sqSrc - 1)){
					return true;
				}
				//兵无论是否过河，都可以前进
				return sqDst == this.forwardOneStep(sqSrc,game.board.sdPlayer);
			default:
				return false;	
		}
	}

	//判断 “将” 是否在九宫格内
	Position.prototype.inFort = function(sq){
		return this.IN_FORT_[sq] != 0;
	}
	//判断“将” 移动是否正确
	Position.prototype.isLegalKingMove = function(sqSrc,sqDst){
		return sqDst == sqSrc - 16 ||
				sqDst == sqSrc - 1 ||
				sqDst == sqSrc + 1 ||
				sqDst == sqSrc + 16;
	}
	//判断 “士” 移动是否正确
	Position.prototype.isLegalAdvisorMove = function(sqSrc,sqDst){
		return sqDst == sqSrc - 17 ||
				sqDst == sqSrc - 15 ||
				sqDst == sqSrc + 15 ||
				sqDst == sqSrc + 17;
	}

	//判断 “相” 的起点和终点是否在同一边,红子是 128 - 255(11111111) 黑子是 0-127(1111111)
	//同一边的棋子，第八位是相同的，异或的值为 0 
	Position.prototype.sameHalf = function(sqSrc,sqDst){
		return ((sqSrc ^ sqDst) & 0x80) == 0;
	}
	//判断是否走田字
	Position.prototype.isLegalBishopMove = function(sqSrc,sqDst){
		 switch(sqDst - sqSrc){
		 	case -34:
		 	case -30:
		 	case 30:
		 	case 34:
		 		return true;
		 	default:
		 		return false;
		 }
	}
	//返回象眼位置
	Position.prototype.bishopEye = function(sqSrc,sqDst){
		return ((sqSrc + sqDst) >> 1);
	}
	//根据起点和终点，确定马脚位置，若起点和终点不是走“日”字，则返回起点
	Position.prototype.knightLeg = function(sqSrc,sqDst){
		switch(sqDst - sqSrc){
			case -33:
			case -31:
				return sqSrc - 16;
			case -18:
			case 14:
				return sqSrc - 1;
			case -14:
			case 18:
				return sqSrc + 1;
			case 31:
			case 33:
				return sqSrc + 16;
			default:
				return sqSrc;
		}
	}
	//判断起点和终点是否同一行 110011 - 111011 1000011-1001011
	Position.prototype.sameRow = function(sqSrc,sqDst){
		return ((sqSrc ^ sqDst) & 0xf0) == 0;
	}
	//判断起点和终点是否同一列
	Position.prototype.sameCol = function(sqSrc,sqDst){
		return ((sqSrc ^ sqDst) & 0x0f) == 0;
	}
	//判断兵有没有过河,棋盘下方，第八位为 1，上方，第八位为 0 ,true时过河
	Position.prototype.awayRiver = function(sqSrc,sd){
		return (sqSrc & 0x80) == (sd << 7);
	}
	//兵 前进一步时的位置
	Position.prototype.forwardOneStep = function(sqSrc,sd){
		return sqSrc - 16 + (sd << 5);
	}
})()