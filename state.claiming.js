var stateClaiming = {

    /** @param {Creep} creep **/
    run: function(creep,hivemind) {
        
        //1.If at target room claim controller
        if(creep.room.name == creep.memory.targetRoom || !creep.memory.targetRoom)
        {
            if(!creep.room.controller || creep.room.controller.my)
            {
                
                creep.memory.targetRoom = hivemind.roomToClaim(creep.memory.home)
                //console.log(creep,creep.memory.targetRoom)
            }
            else if(!creep.pos.isNearTo(creep.room.controller))
            {
                creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else
            {
                creep.claimController(creep.room.controller);
            }
        }
        //2. Else set state to traveling
        else
        {
            //console.log(creep,"Move to target room")
            creep.memory.state = "traveling";
        }
    }
};

module.exports = stateClaiming;