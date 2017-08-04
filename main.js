var helper = require('helper');
var pathCacher = require('pathCacher')
const profiler = require('screeps-profiler');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function() {
  profiler.wrap(function() {
    //Constants
    
    
    helper.clearMemory();
    //Setup
    if(!Memory.Helper) Memory.Helper = {};
    for(rm in Game.rooms)
    {
        var contr = Game.rooms[rm].controller
        if(contr && contr.my)
        {
            var roomName = Game.rooms[rm].name;
            if(!Memory.Helper[roomName])
            {
                //Setup helper object for the room
                var h = helper.setupHelper(Game.rooms[rm]);
                Memory.Helper[roomName] = h
                console.log(Memory.Helper[roomName])
            }
        }
    }
    
    //Memory per owned room
    for(i in Memory.Helper)
    {
        var rh = Memory.Helper[i];
        
        
        if(!Game.spawns[rh.spawnName])
        {
            break;
        }
        rh.room = Game.rooms[rh.room.name]
        var roomCreeps = _.filter(Game.creeps,(c)=>c.memory.spawnRoom == rh.room.name);
        
        pathCacher.generatePaths(rh)
        var amountMiners = _.filter(roomCreeps,(c)=>c.memory.role == 'miner' && c.ticksToLive > 150).length;
        var amountHarvesters = _.filter(roomCreeps,(c)=>c.memory.role == 'harvester' && c.ticksToLive > 150).length;
    	var minerInQueue = rh.pList[0] == 'miner' || rh.pList[1] == 'miner' || rh.pList[2] == 'miner' || rh.pList[3] == 'miner' || rh.pList[4] == 'miner' || rh.pList[0] == 'miniMiner' || rh.pList[1] == 'miniMiner'
    	var harvesterInQueue = rh.pList[0] == 'harvester' || rh.pList[1] == 'harvester' || rh.pList[2] == 'harvester' || rh.pList[3] == 'harvester' || rh.pList[4] == 'harvester' || rh.pList[0] == 'miniHarvester' || rh.pList[1] == 'miniHarvester' || rh.pList[0] == 'bigHarvester' || rh.pList[1] == 'bigHarvester' || rh.pList[2] == 'bigHarvester' || rh.pList[3] == 'bigHarvester' || rh.pList[4] == 'bigHarvester'
        
        var amountCreeps = roomCreeps.length
        
        var spawnUpgraders = rh.room.storage.store.energy > 50 ? 1 : 0;
        
        var spawnBuilders = rh.room.find(FIND_MY_CONSTRUCTION_SITES).length ? 1 : 0;
        
         var spawnMMiners = rh.room.find(FIND_STRUCTURES, {filter: { structureType: STRUCTURE_EXTRACTOR}}).length ? 1 :0;
        var spawnMoreMiners = _.filter(Game.creeps,(c)=>c.memory.role == "miner" && c.body.length > 2 && c.memory.spawnRoom == rh.room.name).length >= rh.amountLocalSources ? 0 : 1;
        
        var maxCreeps = rh.amountLocalSources*3+rh.amountRemoteSources*rh.usingRemote*3 + 4*spawnUpgraders + 1*spawnBuilders + 1 + rh.amountLocalSources*2*spawnMoreMiners + 2*spawnMMiners;
        //Priority list
        if(Game.rooms[rh.room.name].find(FIND_HOSTILE_CREEPS).length)
        {
            if(rh.pList[0] != 'attacker')
            {
                rh.pList[0] = 'attacker'
                
                console.log("Spawning attackers")
            }
            helper.spawnQueue(rh);
        }
        else if(amountHarvesters == 0 && rh.room.energyAvailable < 450)
        {
            rh.pList[0] =  'miniHarvester';
            helper.spawnQueue(rh);
        }
        else if(amountMiners == 0 && rh.room.energyAvailable < 450)
        {
            rh.pList[0] =  'miniMiner';
            helper.spawnQueue(rh);
        }
        
    	else if(amountCreeps < 3)
    	{
    		//STARTUP PRIORITY LIST
    		rh.pList[0] = 'miniMiner';
    		rh.pList[1] = 'miniHarvester';
    		
    		console.log("Spawning mini miner and harvester")
    		helper.spawnQueue(rh);
    	}
    	
    	
        //Only create a new list if the list is empty
        else if((helper.pListEmpty(rh) && amountCreeps < maxCreeps) || (amountMiners < (rh.amountLocalSources+rh.amountRemoteSources*rh.usingRemote) && !minerInQueue) || (amountHarvesters < (rh.amountLocalSources+rh.amountRemoteSources*rh.usingRemote) && !harvesterInQueue))
        {
            if(helper.pListEmpty(rh)){
                console.log("Priority list empty")
            }
            else if((amountMiners < (rh.amountLocalSources+rh.amountRemoteSources*rh.usingRemote) && !minerInQueue)) console.log("Not enough miners");
            else if((amountHarvesters < (rh.amountLocalSources+rh.amountRemoteSources*rh.usingRemote)) && !harvesterInQueue) console.log("Not enough harvesters");
            console.log("Build new priority queue for " + rh.room.name)
        
        	
        	if(!amountMiners)
        	{
        	    //STARTUP PRIORITY LIST
        		rh.pList[0] = 'miniMiner';
        	}
        	else
        	{
        		var roleCount = helper.countRoles(roomCreeps);
        		var requiredCount = {};
        		var priority = 0;
        		//Loop to make a priority list
        		for(i = 0; i < 3 && priority < 9; i++)
        		{
        			var requiredCreep = helper.requiredCreeps(rh,priority);
        			
        			
        			while(requiredCreep)
        			{
        				if(!requiredCount[requiredCreep.role])
        					requiredCount[requiredCreep.role] = 0;
        					
        				requiredCount[requiredCreep.role]+=requiredCreep.amount;
        				//There is not enough creeps of this role
        				if(!roleCount[requiredCreep.role] || roleCount[requiredCreep.role] < requiredCount[requiredCreep.role])
        				{
        				    var r;
        				    
        				    if(!roleCount[requiredCreep.role]) r = requiredCreep.amount
        					else r = Math.min(requiredCreep.amount, requiredCount[requiredCreep.role] - roleCount[requiredCreep.role]);
        					for(j = 0; j < r; j++)
        					{
        						rh.pList[i] = requiredCreep.role;
        						
        						i++;
        						if(i > 2) break;
        					}
        				}
        				
        				priority++;
        				if(i > 2 || priority > 40) break;
        				requiredCreep = helper.requiredCreeps(rh,priority);
        			}
        			
        			
        		}
        	}
        	if(rh.pList[0])
        	{
            	console.log("Priority queue:")
            	var cap = rh.room.energyCapacityAvailable;
            	for(i in rh.pList)
            	{
            	    switch(rh.pList[i])
            	    {
            	        case 'miner':
            	            if(cap < 500)
            	            {
            	                rh.pList[i] = 'miniMiner'
            	            }
            	            break;
        	            case 'harvester':
        	                if(cap < 500)
            	            {
            	                rh.pList[i] = 'miniHarvester'
            	            }
            	            break;
        	            case 'upgrader':
        	                if(cap < 800)
        	                {
        	                    rh.pList[i] = 'miniUpgrader'
        	                }
        	                else if(cap < 1200)
            	            {
            	                rh.pList[i] = 'medUpgrader'
            	            }
            	            break;
        	            case 'builder':
        	                if(cap < 800)
        	                {
        	                    rh.pList[i] = 'miniBuilder'
        	                }
        	                else if(cap < 1200)
            	            {
            	                rh.pList[i] = 'medBuilder'
            	            }
            	            break;
        	            case 'repairer':
        	                if(cap < 800)
        	                {
        	                    rh.pList[i] = 'miniRepairer'
        	                }
        	                else if(cap < 1300)
            	            {
            	                rh.pList[i] = 'medRepairer'
            	            }
            	            break;
            	    }
            	    console.log(rh.pList[i])
            	}
            	    
            	helper.spawnQueue(rh);
        	}
        }
        else
        {
            helper.spawnQueue(rh);
        }
        
        var towers = [Game.getObjectById('5957864b5a6bb76e5ccd032a'),Game.getObjectById('59690403c4e6aa696e88d943')];
        for(t in towers)
        {
            var tower = towers[t];
            if(tower) {
            	var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            		filter: (structure) => structure.hits < 1000 && structure.hits
            	});
            	var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            	if(closestHostile) {
            		tower.attack(closestHostile);
            	}
            	else if(closestDamagedStructure) {
            		tower.repair(closestDamagedStructure);
            	}
            
            	
            
            }
        }
        
       // helper.reassignCreeps(rh);
        
        
    }
    helper.handleRoles(Game.creeps);
    var hostilesCount = {};

    Game.rooms["E66S92"].find(FIND_HOSTILE_CREEPS, { filter: function(i) { 
        if(i.owner.username != 'Source Keeper') {
            hostilesCount[i.owner.username] = hostilesCount[i.owner.username] || 0;
            hostilesCount[i.owner.username]++;
        }
    }});
    
    for(var user in hostilesCount) {
        Game.notify(hostilesCount[user] + ' enemies spotted: user ' + user + ' in room ' + "E66S92");
    }
    
    var link1 = Game.getObjectById('596234654d76880bd1fdb3f1');
    var link2 = Game.getObjectById('5962185d97f66c1fc7c3c6f2');
    if(link1.energy == link1.energyCapacity && link2.energy < 24)
    {
        link1.transferEnergy(link2);
    }
    
    var link3 = Game.getObjectById('59735d9024d33e4abd60d71c');
    var link4 = Game.getObjectById('59735085d9f4c5799e8aae5f');
    if(link3.energy == link3.energyCapacity && link4.energy < 24)
    {
        link3.transferEnergy(link4);
    }
  });
    
}