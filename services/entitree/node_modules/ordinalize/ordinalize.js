module.exports = function(arg){
	let n = parseInt(Number(arg));
	if(isNaN(n) || n < 0) return '';
    var s=["th","st","nd","rd"],
    v=n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
}