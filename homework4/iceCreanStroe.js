let iceCreamFlavors = [
    { name: "Chocolate", type: "Chocolate", price: 2 },
    { name: "StrawBerry", type: "Fruit", price: 1 },
    { name: "Vanilla", type: "Vanilla", price: 2 },
    { name: "Pistachio", type: "Nuts", price: 1.5 },
    { name: "Neapolitan", type: "Chocolate", price: 2},
    { name: "Mint Chip", type: "Chocolate", price: 1.5 },
    { name: "Raspberry", type: "Fruit", price: 1},
    ];

let transactions = []

transactions.push({ scoops: ["Chocolate", "Vanilla", "Mint Chip"], total: 5.5 })
transactions.push({ scoops: ["Raspberry", "StrawBerry"], total: 2 })
transactions.push({ scoops: ["Vanilla", "Vanilla"], total: 4 })

let count = {
    "Chocolate" : 0,
    "StrawBerry" : 0,
    "Vanilla" : 0,
    "Pistachio" : 0,
    "Neapolitan" : 0,
    "Mint Chip" : 0,
    "Raspberry" : 0
}

transactions.forEach((transaction) => {
    transaction.scoops.forEach((scoop) => {
        Object.keys(count).forEach((flavor) => {
            if (scoop === flavor) {
                count[flavor] += 1
            }
        })
    })
})

console.log(count)

