/**
 * 搜索函数
 * 生成电脑自动下子的走法
 */
(function(){
	var search = window.search = function(squares){
		var mvs = gen(squares,game.board.sdPlayer);
		var point = mvs[parseInt(Math.random() * mvs.length)];
		return point;
	}
})()