/**
 * 搜索函数
 * 生成电脑自动下子的走法
 */
(function(){
	var Search = window.Search = function(){
		this.MINMAXDEPTH = 3;
	}
	Search.prototype.searchMain = function(squares){
		this.bestMv = 0;//搜索出的走法
		this.maxMinSearch(squares);//调用极大极小值搜索
		console.log("this.bestMv:",this.bestMv);
		return this.bestMv;
	}
	Search.prototype.maxMinSearch = function(squares){
		//红方调用极大值算法，黑方调用极小值算法
		if(game.board.sdPlayer == 0){
			this.maxSearch(squares,this.MINMAXDEPTH);
		} else {
			this.minSearch(squares,this.MINMAXDEPTH);
		}
	}
	Search.prototype.maxSearch = function(squares,depth){
		if(depth == 0){
			return evaluate(squares,game.board.sdPlayer);
		}
		var best = -Infinity;
		var mvs = gen(squares,game.board.sdPlayer);//生成当前走棋方所有可能的走法
		var mv = 0;
		var value = 0;
		for(var i=0;i<mvs.length;i++){
			mv = mvs[i];
			//执行走法
			if(!game.position.makeMove(mv,squares)){
				continue;
			}
			value = this.minSearch(squares,depth - 1);
			//撤销走法
			game.position.undoMakeMove(squares);

			//寻找最大估值
			if(value > best){
				best = value;
				//如果回到了根节点
				if(depth == this.MINMAXDEPTH){
					this.bestMv = mv;
				}
			}
		}
		return best;
	}

	Search.prototype.minSearch = function(squares,depth){
		if(depth == 0){
			return evaluate(squares,game.board.sdPlayer);
		}
		var best = Infinity;
		var mvs = gen(squares,game.board.sdPlayer);//生成当前走棋方所有可能的走法
		var mv = 0;
		var value = 0;
		for(var i=0;i<mvs.length;i++){
			mv = mvs[i];
			//执行走法
			if(!game.position.makeMove(mv,squares)){
				continue;
			}
			value = this.maxSearch(squares,depth - 1);
			//撤销走法
			game.position.undoMakeMove(squares);

			//寻找最小估值
			if(value < best){
				best = value;
				//如果回到了根节点
				if(depth == this.MINMAXDEPTH){
					this.bestMv = mv;
				}
			}
		}
		return best;
	}
})()