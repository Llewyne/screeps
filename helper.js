/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('helper');
 * mod.thing == 'a thing'; // true
 */

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer =  require('role.repairer');
var roleAttacker = require('role.attacker');
var roleMiner = require('role.miner');
var roleClaimer = require('role.claimer');
var roleThief = require('role.thief');
var roleRaider = require('role.raider');
var roleMMiner = require('role.mminer');
var roleMHarvester = require('role.mharvester');
 

    
var setup = false;

function Helper(rm)
{
    console.log("Setting up helper for room " + rm.name);
    
    this.pList = [];
    this.nextMiningSource = 0;
    this.nextHarvestingSource = 0;
    this.room = rm;
    
    switch(this.room.name)
    {
        case 'E66S92':
            //Sources
            this.localSources = ['58dbc50c8283ff5308a3fe62','58dbc50c8283ff5308a3fe61']
            this.remoteSources = ['58dbc50c8283ff5308a3fe5d','58dbc50c8283ff5308a3fe66','58dbc50c8283ff5308a3fe64']
            this.sources = concat(this.localSources, this.remoteSources);
            this.sourceFlags = ["Source1","Source2","Source3","Source4","Source5"]; //
            this.sourceAssignment = [0,0,0,0,0];
            
            this.harvestAssignment =[[],[],[],[],[]];
            
            this.harvestWaitFlags = ["HarvestWait1","HarvestWait2","HarvestWait3","HarvestWait4","HarvestWait5"];
            var spawnObject = _.filter(Game.spawns,(s)=>s.room == this.room)[0];
            this.spawnName = spawnObject.name;
            this.sourcePaths = [PathFinder.search(Game.flags["Spawn1Start"].pos,Game.flags["Source1"].pos),PathFinder.search(Game.flags["Spawn1Start"].pos,Game.flags["Source2"].pos),PathFinder.search(Game.flags["Spawn1Start"].pos,Game.flags["Source3"].pos)]
            
            this.amountLocalSources = 2; //The amount of local (easy to reach) sources we're mining
            this.amountRemoteSources = 3; //The amount of remote (hard to reach) sources we're mining
            this.usingRemote = 0;
            
            this.pathCache = {}
            
            
            break;
        case 'E65S91':
            //Sources
            this.localSources = ['58dbc5088283ff5308a3fdfd','58dbc5088283ff5308a3fdfe']
            this.remoteSources = []
            this.sources = this.localSources.concat(this.remoteSources);
            this.sourceFlags = ["Room2Source1","Room2Source2"]; //
            this.sourceAssignment = [0,0];
            
            this.harvestAssignment =[[],[]];
            
            this.harvestWaitFlags = ["Room2HarvestWait1","Room2HarvestWait2"];
            var spawnObject = _.filter(Game.spawns,(s)=>s.room.roomName == this.room.roomName)[0];
            this.spawnName = spawnObject.name;
            
            this.amountLocalSources = 2; //The amount of local (easy to reach) sources we're mining
            this.amountRemoteSources = 0; //The amount of remote (hard to reach) sources we're mining
            this.usingRemote = 0;
            this.pathCache = {}
            break;
    }
}

module.exports = {
    reassignCreeps: function(helper)
    {
        switch(helper.room.name)
        {
            case 'E66S92':
                //If there are miners but not on source 1 and not enough energy then assign miners and harvesters to source 1
                if(helper.room.energyAvailable < 1000)
                {
                    var miners = _.filter(Game.creeps,(c)=>c.memory && c.memory.spawnRoom == helper.room.name && c.memory.role == 'miner');
                    var assignMiners = 1;
                    if(miners.length)
                    {
                        for(m in miners)
                        {
                            if(miners[m].memory.targetSource == 0)
                            {
                                assignMiners = 0
                            }
                        }
                        if(assignMiners)
                        {
                        console.log("Reassigning miners")
                        //Reassign
                        miners[0].memory.targetSource = 0;
                        _.filter(_.filter(Game.creeps,(c)=>c.memory.spawnRoom == helper.room.name && c.memory.role == 'harvester'),(c2)=>c2.memory.targetSource = 0);
                        }
                            
                    }
                    
                    var harvesters = _.filter(Game.creeps,(c)=>c.memory && c.memory.spawnRoom == helper.room.name && c.memory.role == 'harvesters');
                    var assignHarvesters = 1;
                    if(harvesters.length)
                    {
                        for(h in harvesters)
                        {
                            if(harvesters[h].memory.targetSource == 0)
                            {
                                assignHarvesters = 0
                            }
                        }
                        if(assignHarvesters)
                        {
                            console.log("Reassigning harvesters")
                            //Reassign
                            harvesters[0].memory.targetSource = 0;
                        }
                            
                    }
    
                }
                break;
        }
    },

    clearMemory: function()
    {
    	//Clear cache
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    },
    
    setupHelper: function(room)
    {
        return new Helper(room)
    },
    
    countRoles: function(creeps)
    {
    	var count = {}
    	for(c in creeps)
    	{
    	    if(creeps[c].ticksToLive < 150) {
    	        continue;
    	    }
    		if(count[creeps[c].memory.role]) count[creeps[c].memory.role] ++;
    		else count[creeps[c].memory.role] = 1;
    	}
    	return count;
    },
    
    requiredCreeps: function(helper,priority)
    {
        var spawnUpgraders = helper.room.storage.store.energy > 50 ? 1 : 0;
        
        var spawnBuilders = helper.room.find(FIND_MY_CONSTRUCTION_SITES).length ? 1 : 0;
        
        var spawnMMiners = helper.room.find(FIND_STRUCTURES, {filter: { structureType: STRUCTURE_EXTRACTOR}}).length ? 1 :0;
        
        var spawnMoreMiners = _.filter(Game.creeps,(c)=>c.memory.role == "miner" && c.body.length > 2 && c.memory.spawnRoom == helper.room.name).length >= helper.amountLocalSources ? 0 : 1;
    	//required amount of creeps per role ordered by priority
    	var requiredCreeps = {}
    	requiredCreeps[0] = {role: 'miner', amount: helper.amountLocalSources}; //One for each local source
    	requiredCreeps[1] = {role: 'harvester', amount: helper.amountLocalSources}; //One for each local source
    	requiredCreeps[2] = {role: 'miner', amount: helper.amountRemoteSources*helper.usingRemote};
    	requiredCreeps[3] = {role: 'harvester', amount: helper.amountRemoteSources*helper.usingRemote*2};
    	requiredCreeps[4] = {role: 'miner', amount: spawnMoreMiners};
    	requiredCreeps[5] = {role: 'harvester', amount: helper.amountLocalSources}; //One for each local source
    	requiredCreeps[6] = {role: 'upgrader', amount: 2*spawnUpgraders};
    	requiredCreeps[7] = {role: 'repairer', amount: 1};
    	requiredCreeps[8] = {role: 'mminer', amount: 1*spawnMMiners};
    	//requiredCreeps[9] = {role: 'mharvester', amount: 1*spawnMMiners};
    	requiredCreeps[9] = {role: 'builder', amount: 1*spawnBuilders};
    	//requiredCreeps[7] = {role: 'thief', amount: 1*helper.usingRemote};
    	requiredCreeps[10] = {role: 'upgrader', amount: 2*spawnUpgraders};
    	
    	return requiredCreeps[priority];
    },
    
    spawn: function(helper,role)
    {
        
    	switch(role)
    	{
    		case 'miniMiner':
    			return this.spawnSpecific('mini miner', 'miner', [WORK,MOVE],helper);
    		case 'miniHarvester':
    			return this.spawnSpecific('mini harvester', 'harvester', [CARRY,MOVE], helper);
			case 'miniUpgrader':
    			return this.spawnSpecific('mini upgrader', 'upgrader', [CARRY,MOVE,WORK], helper,0);
			case 'miniBuilder':
    			return this.spawnSpecific('mini builder', 'builder', [CARRY,MOVE,WORK], helper);
			case 'miniRepairer':
    			return this.spawnSpecific('mini repairer', 'repairer', [CARRY,MOVE,WORK], helper);
			case 'miniThief' :
			    return this.spawnSpecific('mini thief','thief',[MOVE,CARRY,WORK],helper)
			case 'medUpgrader':
    			return this.spawnSpecific('medium upgrader', 'upgrader', [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK], helper,0);
			case 'medBuilder':
    			return this.spawnSpecific('medium builder', 'builder', [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK], helper);
			case 'medRepairer':
    			return this.spawnSpecific('medium repairer', 'repairer', [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK], helper);
			case 'medThief' :
			    return this.spawnSpecific('medium thief','thief',[CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK],helper)
    		case 'miner':
    			return this.spawnSpecific('miner', 'miner', [WORK,WORK,WORK,WORK,MOVE], helper);
    		case 'harvester':
    			return this.spawnSpecific('harvester', 'harvester', [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], helper);
    		case 'upgrader':
    		    if(helper.room.name == "E66S92")
                {
                    	return this.spawnSpecific('upgrader', 'upgrader', [CARRY,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE], helper);
                }
    			return this.spawnSpecific('upgrader', 'upgrader', [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], helper);
    		case 'repairer':
    			return this.spawnSpecific('repairer', 'repairer', [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], helper);
    		case 'builder':
    			return this.spawnSpecific('builder', 'builder', [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], helper);
    		case 'attacker':
    			return this.spawnSpecific('attacker', 'attacker', [ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE], helper);
    		case 'raider':
    			return this.spawnSpecific('raider', 'raider', [ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE], helper);
			case 'thief' :
			    return this.spawnSpecific('thief','thief',[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK],helper)
			case 'bigHarvester':
    			return this.spawnSpecific('big harvester', 'harvester', [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], helper);  
			case 'claimer':
			    return this.spawnSpecific('claimer', 'claimer', [CLAIM,MOVE,MOVE],helper);
		    case 'mminer':
    			return this.spawnSpecific('mineral miner', 'mminer', [WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY], helper);
			case 'mharvester':
    			return this.spawnSpecific('mineral harvester', 'mharvester', [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], helper);
    	}		
    },
    
    handleRoles: function(creeps)
    {
        for(var name in creeps) {
        	var creep = creeps[name];
        	if(creep.memory.role == 'harvester') {
        		roleHarvester.run(creep);
        	}
        	/*(if(creep.memory.role == 'upgrader') {
        		roleUpgrader.run(creep);
        	}
        	if(creep.memory.role == 'builder') {
        		if (roleBuilder.run(creep) == 0)
        		{
        			roleUpgrader.run(creep);
        		}
        	}
        	if(creep.memory.role == 'repairer') {
        		if(roleRepairer.run(creep) == 0)
        		{
        			roleUpgrader.run(creep);
        		}
        	}
        	if(creep.memory.role == 'attacker') {
        		roleAttacker.run(creep);
        	}*/
        	 if(creep.memory.role == 'miner') {
        		roleMiner.run(creep);
        	}/*
        	 if(creep.memory.role == 'claimer') {
        		roleClaimer.run(creep);
        	}
        	if(creep.memory.role == 'thief'){
        	    roleThief.run(creep);
        	}
        	if(creep.memory.role == 'raider'){
        	    roleRaider.run(creep);
        	}
        	if(creep.memory.role == 'mminer'){
        	    roleMMiner.run(creep);
        	}
        	if(creep.memory.role == 'mharvester') {
        		roleMHarvester.run(creep);
        	}*/
        }
    },
    
    pListEmpty: function(helper)
    {
        
        for(i = 0; i < 3; i++)
        {
            if(helper.pList[i]) return false
        }
        return true;
    },
    
    spawnQueue: function(helper)
    {
        for(i in helper.pList)
    	{
    		if(helper.pList[i])
    		{
    			//Check if able to spawn
    			if(this.spawn(helper,helper.pList[i])) 
    			{
    			    helper.pList[i] = 0;
    			}
    			break;
    		}
    	}
    },
    
    spawnSpecific: function(label,r,body,helper,s = -1)
    {
        //console.log("trying to spawn " + r)
        var canSpawn = Game.spawns[helper.spawnName].canCreateCreep(body);
    	if(canSpawn == 0)
    	{
    	    if(s == -1) s = this.assignSource(helper,r);
    		var newName = Game.spawns[helper.spawnName].createCreep(body, undefined, {role: r, targetSource: s, spawnRoom: helper.room.name});
    		console.log('Room ' + helper.room.name + '> Spawning new '+ label + ': ' + newName);
    		if(s!= -1) 
    		{
    		    console.log(newName + ' assigned to source ' + s);
    		    
    		    if(r == 'miner')
    		    {
    		        helper.sourceAssignment[s] = newName;
    		    }
    		    else if (r == 'harvester')
    		    {
    		        assigned = 0
    		        for(a in helper.harvestAssignment)
    		        {
    		            if(helper.harvestAssignment[s][a] == 0)
    		            {
    		                helper.harvestAssignment[s][a] = newName;
    		                assigned = 1
    		            }
    		        }
    		        if(!assigned)
    		        {
    		            helper.harvestAssignment[s][helper.harvestAssignment.length] = newName
    		        }
    		    }
    		}
    		
    		
    		return 1;
    	}
    	else 
    	{
    	    return 0;
    	}
    },
    
    assignSource: function(helper,role)
    {
    	switch(role)
    	{
    		case 'miner':
    		    for(var k = 0; k <(helper.amountLocalSources+helper.amountRemoteSources*helper.usingRemote); k++)
    		    {
    		        if(!Game.creeps[helper.sourceAssignment[k]] || Game.creeps[helper.sourceAssignment[k]].memory.role != 'miner' ||Game.creeps[helper.sourceAssignment[k]].ticksToLive < 151 || Game.creeps[helper.sourceAssignment[k]].body.length < 3)
    		        {
    		            return k;
    		        }
    		    }
    		    return 0;
    		case 'repairer':
    		    return 0;
    		case 'harvester':
    		    /*
    		    var leastHarvesters = 99;
    		    var source = 0
    		    
    			for(var k = 0; k <(helper.amountLocalSources+helper.amountRemoteSources*helper.usingRemote-1); k++)
    		    {
    		        if(!Game.creeps[helper.sourceAssignment[k]] || Game.creeps[helper.sourceAssignment[k]].memory.role != 'miner')
    		        {
    		            helper.sourceAssignment[k] = 0
    		        }
    		        else{
    		            
    		            for(var n in helper.harvestAssignment)
    		            {
    		                var count = 0;
		                    for(var m in helper.harvestAssignment[n])
		                    {
    		                    if(!Game.creeps[helper.harvestAssignment[n][m]] || Game.creeps[helper.harvestAssignment[n][m]].memory.role != 'harvester')
    		                    {
    		                        helper.harvestAssignment[n][m] = 0;
    		                    }
    		                    else
    		                    {
    		                        count++
    		                    }
		                    }
		                    if(count < leastHarvesters)
        		            {
        		                leastHarvesters = count
        		                source = k
        		            }
    		                
    		            }
    		            
    		        }
    		    }
    		    
    		    return source;
    		    */
    		    helper.nextHarvestingSource += 1
    		    if(helper.nextHarvestingSource > (helper.amountLocalSources+helper.amountRemoteSources*helper.usingRemote-1))
    		    {
    		        helper.nextHarvestingSource = 0
    		       
    		    }
    		    return helper.nextHarvestingSource;
    		case 'thief':
    		    return 0;
    		default:
    		{
    		    return -1;
    		}
    		    
    	}
    }
};