var stateCollecting = require('state.collecting');
var stateMining = require('state.mining');
var stateDropOff = require('state.dropOff');
var stateUpgrading = require('state.upgrading');
var stateBuilding = require('state.building');
var stateAttacking = require('state.attacking');
var stateTraveling = require('state.traveling');
var stateClaiming = require('state.claiming');
var stateBoosting = require('state.boosting');
var stateRedistributing = require('state.redistributing');
var stateFilling = require('state.filling');
var stateTransfering = require('state.transfering');
var stateMoving = require('state.moving');

//Far
var stateHauling = require('state.hauling')
var stateReserving = require('state.reserving');
var stateFarMining = require('state.farMining');
var stateRepairing = require('state.repairing');
var stateThieving = require('state.thieving');
var stateRaiding = require('state.raiding');
var stateDismantling = require('state.dismantling');
var stateTanking = require('state.tanking');
var stateHealing = require('state.healing');
var stateRoadBuilding = require('state.roadBuilding');
var stateScouting = require('state.scouting');

//Mineral creeps
var stateMinCollecting = require('state.minCollecting');
var stateMinMining = require('state.minMining');
var stateMinDropOff = require('state.minDropOff');

//Other
var trading = require('trading');
var helper = require('helper');
var defense = require('defense');
var buildup = require('buildup');
var Traveler = require('Traveler');
var Hivemind = require('hivemind');

var cpuLog = false;

module.exports.loop = function() {
    if(!Memory.counter)Memory.counter = 0;
    if(!Memory.queuedCreep)Memory.queuedCreep = [];
    if(!Memory.queuedCreeps )Memory.queuedCreeps = [];
    
    //console.log(attackersInRoom)
    //if(!Memory.queuedCreeps.length && exInRoom.length < 5)Memory.queuedCreeps = [["E23N57","mining"],["E23N57","building"],["E23N57","collecting"]];
    if(Memory.queuedCreeps.length && !Memory.queuedCreep.length) 
    {
        Memory.queuedCreep = Memory.queuedCreeps[0];
        Memory.queuedCreeps = _.drop(Memory.queuedCreeps,1);
    }
    
    Hivemind.setup();
    //Clear cache
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            Hivemind.clearAmountCreeps(Memory.creeps[i].home,Memory.creeps[i].defaultState)
            delete Memory.creeps[i];
        }
    }
    
    var rooms = _.sortBy(_.filter(Game.rooms,(r)=>r.controller&& r.controller.my),(r)=>r.controller.level).reverse();
    //console.log(rooms)
    var count =-1;
    for(var room in rooms)
    {
        count++;
        room = rooms[room]
        //console.log(room)
        if(!room.controller || !room.controller.my) continue;
        
        //Defense
        defense.run(room);
        
        //Buildup
        if(Game.time % 3 == 0)buildup.run(room);
        
        //Trading
        if(room.terminal && Game.time % 2 == 0) trading.run(room.terminal);
        
        var spawns = _.filter(Game.spawns,(s)=>s.room==room);
        //console.log(room,spawns)
        if(!spawns.length)continue;
        //console.log("before spawning",Game.cpu.getUsed())
        if((Game.time+count) % 3 == 0)helper.requireCreep(room,Hivemind);
        
        if(cpuLog) console.log("before towers",Game.cpu.getUsed())
        //Towers
        var towers = room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_TOWER }});
            
        for(var t in towers)
        {
            var tower = towers[t];
            if(tower) {
            	var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            		filter: (structure) => structure.hits < 1000 && structure.hits && structure.hits < structure.hitsMax
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
        
        //Links
        //console.log("before links",Game.cpu.getUsed())
        var currentSites = room.find(FIND_CONSTRUCTION_SITES).length;
        //console.log(room,currentSites,Memory.Hivemind.roomInfo[room.name].amountSites)
        if(Memory.Hivemind.roomInfo[room.name] &&  (Number.isInteger(Memory.Hivemind.roomInfo[room.name].amountSites) && Memory.Hivemind.roomInfo[room.name].amountSites > currentSites))
        {
            //console.log(room,"cleringlinks",Memory.Hivemind.roomInfo[room.name].amountSites)
            Hivemind.clearMemory('sourceLinks')
            Hivemind.clearMemory('farmLinks')
            Hivemind.clearMemory('upgradeLinks')
            Hivemind.clearMemory('storageLinks')
        }

        Memory.Hivemind.roomInfo[room.name].amountSites = currentSites;
        
        //Order of importance: source->farms,source->upgraders
        var sourceLinks = Hivemind.find({type:'sourceLinks',room:room.name});
        var farmLinks = Hivemind.find({type:'farms',room:room.name});
        var upgradeLink = Hivemind.find({type:'upgradeLinks',room:room.name})
        var storageLink = Hivemind.find({type:'storageLinks',room:room.name});
        
        for(sl in sourceLinks)
        {
            var from = Game.getObjectById(sourceLinks[sl]);
            if(!from) 
            {   
                Hivemind.clearMemory('sourceLinks')
                console.log("n")
                break;
            }
            
            for(fl in farmLinks)
            {
                var to = Game.getObjectById(farmLinks[fl]);
                if(!to) 
                {
                    Hivemind.clearMemory('farmLinks')
                    break;
                }
                if(from.energy == from.energyCapacity && to.energy < 24)
                {
                    if(from.transferEnergy(to) === 0)
                    {
                        console.log(room,"Transfered energy from",from.id,"to farm",to.id);
                        break;
                    }
                    
                }
            }
            
            var to = Game.getObjectById(upgradeLink);
            if(!to) 
            {
                Hivemind.clearMemory('upgradeLinks')
                break;
            }
            
            if(from.energy == from.energyCapacity && to.energy < 24)
            {
                if(from.transferEnergy(to) === 0)
                {
                    console.log(room,"Transfered energy from",from.id,"to upgrader",to.id);
                    break;
                }
                
            }
        }
            
        var from = Game.getObjectById(storageLink);
        if(!from) 
        {
            //Hivemind.clearMemory('storageLinks')
        }
        else
        {
            for(fl in farmLinks)
            {
                var to = Game.getObjectById(farmLinks[fl]);
                if(!to) 
                {
                    Hivemind.clearMemory('farms')
                    break;
                }
                if(from.energy == from.energyCapacity && to.energy < 24)
                {
                    if(from.transferEnergy(to) === 0)
                    {
                        console.log(room,"Transfered energy from storage to farm",to.id);
                    }
                    
                }
            }
        }
            
            
            
    }
    
   for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(!creep.memory.state) creep.memory.state = creep.memory.defaultState;
        if(!creep.memory.state) creep.memory.defaultState = "collecting";
        if(!creep.memory.home) creep.memory.home = creep.room.name;
        if(creep.memory.state == "collecting")
        {
            stateCollecting.run(creep,Hivemind);
        }
        else if(creep.memory.state == "mining")
        {
            stateMining.run(creep,Hivemind);
        }
        else if(creep.memory.state == "dropOff")
        {
            stateDropOff.run(creep,Hivemind);
        }
        else if(creep.memory.state == "upgrading")
        {
            stateUpgrading.run(creep,Hivemind);
        }
        else if(creep.memory.state == "building")
        {
            stateBuilding.run(creep,Hivemind);
        }
        else if(creep.memory.state == "attacking" || creep.memory.state == "rAttacking")
        {
            stateAttacking.run(creep,Hivemind);
        }
         else if(creep.memory.state == "claiming")
        {
            stateClaiming.run(creep,Hivemind);
        }
         else if(creep.memory.state == "traveling")
        {
            stateTraveling.run(creep);
        }
        else if(creep.memory.state == "minCollecting")
        {
            stateMinCollecting.run(creep);
        }
        else if(creep.memory.state == "minMining")
        {
            stateMinMining.run(creep);
        }
        else if(creep.memory.state == "minDropOff")
        {
            stateMinDropOff.run(creep);
        }
        else if(creep.memory.state == "hauling")
        {
            stateHauling.run(creep,Hivemind);
        }
        else if(creep.memory.state == "reserving")
        {
            stateReserving.run(creep,Hivemind);
        }
        else if(creep.memory.state == "farMining")
        {
            stateFarMining.run(creep,Hivemind);
        }
        else if(creep.memory.state == "repairing")
        {
            stateRepairing.run(creep);
        }
        else if(creep.memory.state == "boosting")
        {
            stateBoosting.run(creep);
        }
        else if(creep.memory.state == "redistributing")
        {
            stateRedistributing.run(creep);
        }
        else if(creep.memory.state == "filling")
        {
            stateFilling.run(creep,Hivemind);
        }
        else if(creep.memory.state == "transfering")
        {
            stateTransfering.run(creep);
        }
        else if(creep.memory.state == "thieving")
        {
            stateThieving.run(creep,Hivemind);
        }
        else if(creep.memory.state == "moving")
        {
            stateMoving.run(creep);
        }
        else if(creep.memory.state == "raiding")
        {
            stateRaiding.run(creep);
        }
        else if(creep.memory.state == "dismantling")
        {
            stateDismantling.run(creep);
        }
        else if(creep.memory.state == "tanking")
        {
            stateTanking.run(creep);
        }
        else if(creep.memory.state == "healing")
        {
            stateHealing.run(creep);
        }
         else if(creep.memory.state == "roadBuilding")
        {
            stateRoadBuilding.run(creep,Hivemind);
        }
         else if(creep.memory.state == "scouting")
        {
            stateScouting.run(creep,Hivemind);
        }
        else
        {
            //console.log(creep,creep.pos,"invalid state",creep.memory.state)
        }
        //console.log(creep.memory.state,Game.cpu.getUsed())
   }
   
   //Secondary states
   /*for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.state == "traveling")
        {
            stateTraveling.run(creep);
        }
        else if(creep.memory.state == "roadBuilding")
        {
            stateRoadBuilding.run(creep,Hivemind);
        }
   }*/
};