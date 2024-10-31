const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let player = []
let bank = []

// Bank의 카드를 먼저 1장 뽑습니다.
bank.push(Math.floor(Math.random() * 11) + 1)
console.log(`Bank의 첫번째 카드는 ${bank} 입니다.`)

// 사용자의 카드 전체를 뽑는 함수입니다.
function drawCard() {
    player.push(Math.floor(Math.random() * 11) + 1)

    if (player.length === 2 && player.reduce((acc, curr) => acc + curr, 0) === 21) {
        console.log(`Player의 카드는 ${player} 입니다.`)
        console.log(`Player가 블랙잭을 완성했습니다.`)
        process.exit(0)
    }

    if (player.reduce((acc, curr) => acc + curr, 0) > 21) {
        console.log(`Player의 카드는 ${player} 입니다.`)
        console.log(`Player가 버스트되었습니다.`)
        process.exit(0)
    }

    console.log(`\nPlayer의 카드는 ${player} 입니다.`)
    rl.question('카드를 더 받으시겠습니까? (Y/N)', (answer) => {
        if (answer === 'Y') {
            drawCard()
        }
        else {
            console.log(`Player의 카드는 ${player} 입니다.`)
            rl.close()
            // 사용자 카드 뽑기가 완료되면 딜러의 카드를 뽑습니다.
            drawBankCard()
        }
    })
}

//Bank의 카드 전체를 뽑는 함수입니다.
function drawBankCard() {
    console.log("Bank의 카드를 뽑겠습니다.");

    while (bank.reduce((acc, curr) => acc + curr, 0) < 17) {
        bank.push(Math.floor(Math.random() * 11) + 1)
        console.log(`Bank의 카드는 ${bank} 입니다.`)

        if (bank.reduce((acc, curr) => acc + curr, 0) > 21) {
            console.log(`Bank가 버스트되었습니다.`)
            process.exit(0)
        }
    }

    if (bank.reduce((acc, curr) => acc + curr, 0) > player.reduce((acc, curr) => acc + curr, 0)) {
        console.log(`Bank가 이겼습니다.`)
    }
    else if (bank.reduce((acc, curr) => acc + curr, 0) < player.reduce((acc, curr) => acc + curr, 0)) {
        console.log(`Player가 이겼습니다.`)
    }
    else {
        console.log(`비겼습니다.`)
    }
}

// 사용자의 카드를 뽑습니다.
drawCard()