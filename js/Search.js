/**
 * 搜索函数
 * 生成电脑自动下子的走法
 */
(function(){
	var Search = window.Search = function(){
		this.MINMAXDEPTH = 4;
		this.MAXSEARCHDEPTH = 64; //最大搜索深度
		this.MATE_VALUE = 10000;
		this.millis = 100;
	}
	/**
	 * @param   squares 当前棋盘数组
	 * @param   millis  搜索最大时长
	 * @return {[type]}         [description]
	 */
	Search.prototype.searchMain = function(squares){
		this.bestMv = 0;//搜索出的走法
		//初始alpha为负无穷，beta为正无穷
		var alpha = -this.MATE_VALUE;
		var beta = this.MATE_VALUE;
		game.position.step = 0; //每次搜索时，都重置搜索深度
		//迭代加深搜索
		var startTime = new Date().getTime(); //获取开始搜索时时间
		for(var i = 1; i <= this.MAXSEARCHDEPTH; i++){
			this.negaMaxSearch(squares,i,alpha,beta);//负极大值搜索
			if(new Date().getTime() - startTime > this.millis){//超出预定时间，则不再搜索
				break;
			}
		}

		console.log("this.bestMv:",this.bestMv);
		return this.bestMv;
	}
	Search.prototype.negaMaxSearch = function(squares,depth,alpha,beta){
		if(depth == 0){
			return evaluate(squares,game.board.sdPlayer);
		}
		var mvs = gen(squares,game.board.sdPlayer);//生成当前走棋方所有可能的走法
		var mv = 0;
		var value = 0;
		//当前最佳值
		var vlBest = -this.MATE_VALUE; 
		for(var i=0;i<mvs.length;i++){
			mv = mvs[i];
			//执行走法
			if(!game.position.makeMove(mv,squares)){
				continue;
			}
			value = -this.negaMaxSearch(squares,depth - 1,-beta,-alpha);
			//撤销走法
			game.position.undoMakeMove(squares);

			if(value > vlBest){
				vlBest = value;
				// 得到一个大于或等于beta的值，就终止对当前节点的搜索，并返回beta
				if(value >= beta){
					return beta;
				}
				if(value > alpha){
					alpha = value;
					//如果回到了根节点
					if(game.position.step == 0){
						this.bestMv = mv;
					}
				}
			}		
		}
		//此时已经进行将军,可以选择深度最低的步骤
		if(vlBest == -this.MATE_VALUE){
			return game.position.step - this.MATE_VALUE;
		}
		return alpha;
	}
})()