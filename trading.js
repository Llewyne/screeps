var trading = {
    
    run: function(terminal) {
        
        //Sell prices
        var prices = [];
        prices[RESOURCE_ZYNTHIUM] = 0.045;
        prices[RESOURCE_GHODIUM_OXIDE] = 0.18;
        /*prices[RESOURCE_ZYNTHIUM_HYDRIDE] = 0.4;
        prices[RESOURCE_KEANIUM_OXIDE] = 0.1;
        prices[RESOURCE_UTRIUM_HYDRIDE] = 0.1;*/
        prices[RESOURCE_OXYGEN] = 0.1;
        prices[RESOURCE_CATALYST] = 0.188;
        prices[RESOURCE_HYDROGEN] = 0.157;
	    
	    for(var r in prices)
	    {
    	    if(terminal.store[r])
    	    {
    	        //determine if the highest buying price is higher than set price
    	        var orders = _.filter(Game.market.getAllOrders({type:ORDER_BUY,resourceType: r}),(o)=>o.price > prices[r]);
    	        /*if(orders.length)
    	        {
    	            orders = _.sortBy(orders,(o)=>o.price);
    	            var highest = orders[orders.length-1]
    	            //console.log("Highest price for",r,": ",JSON.stringify(highest))
    	            prices[r] = highest.price;
    	        }*/
    	        
    	        var ordersForR = _.filter(Game.market.orders,(o)=>o.resourceType == r);
    	        if(!ordersForR.length)
    	        {
    	            //Create order
        	        var order = Game.market.createOrder(ORDER_SELL,r,prices[r],Math.min(terminal.store[r],1000),terminal.room.name);
        	        if(order == 0){
        	            console.log("Created order for room ",terminal.room.name," resource: ", r, "price: ", prices[r]);
        	        }
    	        }
    	        else
    	        {
    	            for(o in ordersForR)
    	            {
        	            if(prices[r] != ordersForR[o].price)
                        {
                            Game.market.changeOrderPrice(ordersForR[o].id,prices[r]);
                            console.log("Changed price for ", r, "to ",prices[r])
                        }
    	                if(ordersForR[o].remainingAmount == 0)
    	                {
    	                    
    	                    var result = Game.market.extendOrder(ordersForR[o].id,1000);
    	                    console.log("Extended order for room ",terminal.room.name," resource: ", r, "price: ", prices[r]);
    	                }
    	            }
    	        }
                //Find energy deals
                /*var energyBuyOrders = Game.market.getAllOrders((o)=> o.type == ORDER_BUY && o.resourceType == r && o.price >= prices[r] && o.amount);
                
                energyBuyOrders = _.sortBy(energyBuyOrders, (o)=>o.price)
                //console.log(energyBuyOrders)
                _.forEachRight(energyBuyOrders, function(o)
                {
                    var cost = Game.market.calcTransactionCost(o.remainingAmount,terminal.room.name,o.roomName)
                    //console.log(cost)
                    if(cost <= terminal.store.energy && cost <= o.remainingAmount)
                    {
                        console.log("Found order:", JSON.stringify(o), cost);
                        console.log("Making deal:",Game.market.deal(o.id,_.min([terminal.store[r],o.remainingAmount]),terminal.room.name));
                    }
                });*/
                
    	    }
	    }
	    //console.log(terminal.store["XGH2O"])
	    /*
        if((terminal.store["XGH2O"] < 150 || !terminal.store["XGH2O"]) && Game.market.credits > 900)
        {
            //console.log("test2")
            //Find energy deals
            var sellOrders = Game.market.getAllOrders((o)=> o.type == ORDER_SELL && o.resourceType == RESOURCE_CATALYZED_GHODIUM_ACID && o.price <= 4.9);
            
            sellOrders = _.sortBy(sellOrders, (o)=>o.price)
            //console.log(sellOrders)
            _.forEach(sellOrders, function(o) {
                var cost = Game.market.calcTransactionCost(o.remainingAmount,terminal.room.name,o.roomName)
                //console.log(cost)
                if(cost <= terminal.store.energy && cost <= o.remainingAmount)
                {
                    console.log("Found order:", JSON.stringify(o), cost);
                    console.log("Making deal:",Game.market.deal(o.id,Math.min(150,o.remainingAmount),terminal.room.name));
                }
            });
        }*/
        
	}
};

module.exports = trading;