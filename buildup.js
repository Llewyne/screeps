var buildup = {
    
    run: function(room, hivemind) {
	    //Things to build:
	    //Walls and Ramparts
	    
	    //Farms 9x9 space
	    //Use farm flags
    	var farmFlags = _.filter(Game.flags,(f)=>f.name.includes("farm") && f.room == room);
    	//console.log(JSON.stringify(farmFlags))
    	
    	//Construction Grid
    	var cg = [
    	    {x:0,y:0,type:STRUCTURE_SPAWN},
    	    {x:0,y:1,type:STRUCTURE_EXTENSION},{x:-1,y:0,type:STRUCTURE_EXTENSION},{x:1,y:0,type:STRUCTURE_EXTENSION},
    	    {x:-1,y:2,type:STRUCTURE_EXTENSION},{x:-2,y:2,type:STRUCTURE_EXTENSION},{x:-2,y:1,type:STRUCTURE_EXTENSION},
    	    {x:1,y:2,type:STRUCTURE_EXTENSION},{x:2,y:2,type:STRUCTURE_EXTENSION},{x:2,y:1,type:STRUCTURE_EXTENSION},
    	    {x:-3,y:1,type:STRUCTURE_EXTENSION},{x:-3,y:0,type:STRUCTURE_EXTENSION},{x:-1,y:-1,type:STRUCTURE_EXTENSION},
    	    {x:3,y:1,type:STRUCTURE_EXTENSION},{x:3,y:0,type:STRUCTURE_EXTENSION},{x:1,y:-1,type:STRUCTURE_EXTENSION},
    	    {x:-2,y:-1,type:STRUCTURE_EXTENSION},{x:2,y:-1,type:STRUCTURE_EXTENSION},
    	    {x:0,y:3,type:STRUCTURE_EXTENSION},{x:-1,y:4,type:STRUCTURE_EXTENSION},{x:1,y:4,type:STRUCTURE_EXTENSION},
    	    {x:-2,y:3,type:STRUCTURE_EXTENSION},{x:-3,y:3,type:STRUCTURE_EXTENSION},{x:-3,y:4,type:STRUCTURE_EXTENSION},
    	    {x:2,y:3,type:STRUCTURE_EXTENSION},{x:3,y:3,type:STRUCTURE_EXTENSION},{x:3,y:4,type:STRUCTURE_EXTENSION},
    	    {x:0,y:4,type:STRUCTURE_LINK},
    	    {x:0,y:2,type:STRUCTURE_ROAD},{x:-1,y:1,type:STRUCTURE_ROAD},{x:-2,y:0,type:STRUCTURE_ROAD},
    	    {x:1,y:1,type:STRUCTURE_ROAD},{x:2,y:0,type:STRUCTURE_ROAD},{x:-1,y:3,type:STRUCTURE_ROAD},
    	    {x:-2,y:4,type:STRUCTURE_ROAD},{x:1,y:3,type:STRUCTURE_ROAD},{x:2,y:4,type:STRUCTURE_ROAD},
    	    {x:-5,y:-3,type:STRUCTURE_WALL},{x:-5,y:-2,type:STRUCTURE_WALL},{x:-4,y:-3,type:STRUCTURE_WALL},
    	    {x:-5,y:5,type:STRUCTURE_WALL},{x:-5,y:6,type:STRUCTURE_WALL},{x:-4,y:6,type:STRUCTURE_WALL},
    	    {x:5,y:-3,type:STRUCTURE_WALL},{x:5,y:-2,type:STRUCTURE_WALL},{x:4,y:-3,type:STRUCTURE_WALL},
    	    {x:5,y:5,type:STRUCTURE_WALL},{x:5,y:6,type:STRUCTURE_WALL},{x:4,y:6,type:STRUCTURE_WALL},
    	    {x:-2,y:-3,type:STRUCTURE_WALL},{x:-1,y:-3,type:STRUCTURE_WALL},{x:0,y:-3,type:STRUCTURE_WALL},
    	    {x:1,y:-3,type:STRUCTURE_WALL},{x:2,y:-3,type:STRUCTURE_WALL},
    	    {x:-2,y:6,type:STRUCTURE_WALL},{x:-1,y:6,type:STRUCTURE_WALL},{x:0,y:6,type:STRUCTURE_WALL},
    	    {x:1,y:6,type:STRUCTURE_WALL},{x:2,y:6,type:STRUCTURE_WALL},
    	    {x:-5,y:-1,type:STRUCTURE_RAMPART},{x:-5,y:0,type:STRUCTURE_WALL},{x:-5,y:1,type:STRUCTURE_WALL},
    	    {x:-5,y:2,type:STRUCTURE_WALL},{x:-5,y:3,type:STRUCTURE_WALL},
    	    {x:5,y:-1,type:STRUCTURE_RAMPART},{x:5,y:0,type:STRUCTURE_WALL},{x:5,y:1,type:STRUCTURE_WALL},
    	    {x:5,y:2,type:STRUCTURE_WALL},{x:5,y:3,type:STRUCTURE_WALL},
    	    {x:-3,y:-3,type:STRUCTURE_RAMPART},{x:3,y:-3,type:STRUCTURE_RAMPART},{x:-3,y:6,type:STRUCTURE_RAMPART},
    	    {x:-5,y:4,type:STRUCTURE_RAMPART},{x:5,y:4,type:STRUCTURE_RAMPART},
    	    {x:3,y:6,type:STRUCTURE_RAMPART},{x:0,y:-2,type:STRUCTURE_TOWER}]
    	
    	for(var flag in farmFlags)
    	{
    	    var flagPos = farmFlags[flag].pos;
    	    
    	    for(var s in cg)
    	    {
    	        s = cg[s];
    	        room.getPositionAt(flagPos.x+s.x,flagPos.y+s.y).createConstructionSite(s.type);
    	        
    	    }
    	}
    	    
	    
	    //Mine Links
	    
	    //Towers?
	    
	    //List of buildup structures
	    var ss = [];
	    switch(room.name)
	    {
	       case "E29N54":
	           ss[STRUCTURE_EXTENSION] = [[]];//[[31,12],[31,13],[30,13],[32,13],[31,14],[32,11],[33,11],[33,10],[33,12],[34,11]];
	           break;
	       case "E24N59":
	           ss[STRUCTURE_SPAWN] = [[28,38]]
	           ss[STRUCTURE_EXTENSION] = [[27,38],[28,39],[26,38],[28,40],[26,39],[27,40]]
	           break;
	       case "E23N57":
	           ss[STRUCTURE_SPAWN] = [[30,10]]
	           ss[STRUCTURE_EXTENSION] = [[29,10],[28,10],[30,12]]
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

module.exports = buildup;