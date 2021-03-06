var defense = {
    
    run: function(room) {
        
        var spawn = room.find(FIND_MY_SPAWNS)[0];
        if(spawn)
        {
            if(spawn.hits < 2500)
            {
                console.log(room,"under attack")
                if(!room.controller.safeMode)
                {
                    console.log("turning on safe mode")
                    room.controller.activateSafeMode();
                }
            }
        }
        
	    //Handle other users
	    var enemyCreeps = room.find(FIND_HOSTILE_CREEPS);
	    for(var c in enemyCreeps)
	    {
	        c = enemyCreeps[c];
	        if(_.filter(c.body,(bp)=>bp.type == ATTACK).length)
	        {
	            _.remove(Memory.friendList,(u)=> u==c.username);
	        }
	    }
	    
	    
	    //List of defensive structures per room that need to be rebuilt if they are no longer there
	    var ss = [];
	    switch(room.name)
	    {
	        case "E29N57":
	            ss[STRUCTURE_TOWER] = [[28,30]];
	            ss[STRUCTURE_RAMPART] = [[14,47],[15,47],[8,2],[9,2],[25,2],[26,47],[27,47],[26,2]];
	            ss[STRUCTURE_WALL] = [
	                [6,47],[7,47],[8,47],[9,47],[10,47],[11,47],[12,47],[16,47],[17,47],[18,47],
	                [23,47],[24,47],[25,47],[28,47],[29,47],
	                [30,47],[32,47],[42,44],[43,44],[44,44],
	                [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
	                [22,2],[23,2],[24,2],
	                [27,2],[28,2],[29,2],[30,2],[31,2],[32,2],[33,2],[34,2],[35,2],[36,2],[37,2],[38,2],[39,2],[40,2],[41,2],[42,2],[43,2],[44,2]];
	           break;
	       case "E28N57":
	           ss[STRUCTURE_TOWER] = [[19,32],[9,32]];
	           ss[STRUCTURE_RAMPART] = [[32,7],[33,7]];
	           ss[STRUCTURE_WALL] = [
	                [2,19],[2,20],[2,21],[2,23],[2,24],[2,25],
	                [30,7],[31,7],[34,7],[35,7],[36,7],[37,7],[38,7],[39,7],[40,7],[41,7],[42,7],[43,7]];
	           break;
	       case "E28N55":
	           ss[STRUCTURE_TOWER] = [[39,15],[19,26]];
	           ss[STRUCTURE_RAMPART] = [[13,7],[14,7],[23,2],[24,2],[4,42],[4,43],[22,47],[23,47],[42,47],[43,47]];
	           ss[STRUCTURE_WALL] = [
	                [21,47],[24,47],[25,47],[26,47],[27,47],[28,47],[29,47],[30,47],[31,47],[32,47],[33,47],[34,47],[35,47],[36,47],[37,47],[38,47],[39,47],[40,47],[41,47],[44,47],
	                [4,40],[4,41],[4,44],
	                [12,7],[15,7],
	                [21,2],[22,2],[25,2]];
	           break;
	       case "E29N54":
	           ss[STRUCTURE_TOWER] = [[29,11],[33,15]];
	           ss[STRUCTURE_RAMPART] = [[2,15],[2,16],[6,2],[25,2],[26,2],[47,12],[47,13]];
	           ss[STRUCTURE_WALL] = [
	                [1,12],[2,12],[2,13],[2,14],[2,17],[2,18],[2,19],
	                [48,5],[47,5],[47,6],[47,7],[47,8],[47,9],[47,10],[47,11],[47,14],
	                [47,15],[47,16],[47,17],[47,18],[47,19],[47,20],[47,21],[47,22],[47,23],[47,24],
	                [47,25],[47,26],[47,27],[47,28],[47,29],[47,30],[47,31],[47,32],[47,33],[47,34],
	                [47,35],[47,36],[47,37],[47,38],[47,39],[47,40],[47,41],[47,42],[47,43],
	                [3,2],[4,2],[5,2],[8,2],[9,2],[10,2],[10,1],[20,2],[21,2],[22,2],[23,2],[24,2],[27,2],[28,2]];
	           break;
	       case "E25N53":
	           ss[STRUCTURE_TOWER] = [[26,17],[31,22]];
	           ss[STRUCTURE_RAMPART] = [[2,16],[2,17],[2,20],[2,21],[3,31],[4,31],[5,37],[5,38],[20,47],
	                [21,47],[5,2],[6,2],[9,2],[10,2],[32,2],[33,2],[36,2],[41,2],[42,2],
	                [47,9],[48,9],[45,23],[45,24]];
	           ss[STRUCTURE_WALL] = [[1,14],[2,14],[2,15],[2,18],[2,19],[2,22],[2,23],[1,31],[2,31],[5,31],[5,36],
	                [15,47],[18,47],[19,47],[22,47],[23,47],[24,47],[25,47],[25,48],
	                [3,2],[4,2],[7,2],[8,2],[11,2],[12,2],[12,1],
	                [30,1],[30,2],[31,2],[34,2],[35,2],[37,2],[38,2],[39,2],[40,2],[43,2],[44,2],[45,2],[46,2],[47,2],
	                [46,9],[45,25],[46,25],[47,25],[48,25]];
	                break;
	       case "E24N59":
	           ss[STRUCTURE_TOWER] = [[32,47],[47,43]];
	           ss[STRUCTURE_RAMPART] = [[32,47],[33,47],[47,44],[47,43],[2,46],[2,32],[2,33]];
	           ss[STRUCTURE_WALL] = [[1,30],[2,30],[2,31],[2,34],[2,35],[2,36],[2,44],[2,45],[2,47],
	                [29,47],[30,47],[31,47],[34,47],[35,47],[36,47],[37,47],[38,47],[38,48],
	                [47,29],[47,30],[47,31],[47,32],[47,33],[47,34],[47,35],[47,36],[47,37],[47,38],[47,39],[47,40],[47,41],[47,42],[47,45],[47,46],[48,46],
	                [3,8],[4,8],[5,8],[6,8],[7,8]];
	                break;
	       case "E23N57":
	           ss[STRUCTURE_TOWER] = [[30,7]];
	           ss[STRUCTURE_RAMPART] = [[2,38],[2,28],[2,29],[13,2],[14,2],[2,38],[15,47],[16,47],[30,47],[31,47],[40,47],[41,47],[47,13],[47,14],[47,32],[47,33]];
	           ss[STRUCTURE_WALL] = [[10,2],[11,2],[12,2],[15,2],[16,2],[17,2],[18,2],[19,2],[20,2],
	           [2,23],[2,24],[2,25],[2,26],[2,27],[2,30],[2,31],[2,32],[2,33],[2,37],[2,39],[3,43],[3,44],
	           [12,47],[13,47],[14,47],[17,47],[18,47],[19,47],[20,47],[21,47],[22,47],[23,47],[24,47],[25,47],[26,47],[27,47],[28,47],[29,47],
	           [32,47],[33,47],[34,47],[35,47],[36,47],[37,47],[38,47],[39,47],[42,47],[43,47],
	           [47,8],[47,9],[47,10],[47,11],[47,12],[47,15],[47,16],[47,17],[47,18],[47,19],[47,20],[47,21],[47,22],[47,23],[47,24],
	           [47,25],[47,26],[47,27],[47,28],[47,29],[47,30],[47,31],[47,34],[47,35],[47,36],[47,37],[47,38],[47,39],[47,40],[47,41],[47,42],[48,42]];
	           break;
           case "E27N57":
	           ss[STRUCTURE_TOWER] = [[10,11],];
	           ss[STRUCTURE_RAMPART] = [[8,2],[11,2],[20,43],[22,43],[26,43],[27,43],[28,43]];
	           ss[STRUCTURE_WALL] = [];
	                break;
	    }
	    
	    for(var s in ss)
	    {
	        for(var p in ss[s])
	        {
	            if(!room.lookForAt(FIND_STRUCTURES,ss[s][p][0],ss[s][p][1]).length)
	            {
	                room.createConstructionSite(ss[s][p][0],ss[s][p][1],s);
	            }
	        }
	    }
        
	}
};

module.exports = defense;