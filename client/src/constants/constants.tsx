export const testItems = [
    {id : 1, name : "Item 1", points : 10, found : false},
    {id : 2, name : "Item 2", points : 20, found : false},
]

export const testPlayers = [
    {name : "Dave", points : 20, items : 
        [{id : 1, name : "Item 1", points : 10, found : false},
         {id : 2, name : "Item 2", points : 20, found : true}]
    },
    
    {name : "Mike", points : 10, items : 
        [{id : 1, name : "Item 1", points : 10, found : true},
         {id : 2, name : "Item 2", points : 20, found : false}]
    },

    {name : "Morgan", points : 30, items : 
        [{id : 1, name : "Item 1", points : 10, found : true},
         {id : 2, name : "Item 2", points : 20, found : true}]
    },

    {name : "Adam", points : 0, items : 
        [{id : 1, name : "Item 1", points : 10, found : false},
         {id : 2, name : "Item 2", points : 20, found : false}]
    },

    {name : "Sarah", points : 50, items : []},
    {name : "Timothy", points : 40, items : []},
]