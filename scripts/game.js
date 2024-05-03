var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
let platforms;
let player;
let meat;

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('meat', 'assets/meat.png');
    this.load.image('meteor', 'assets/meteor.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    this.add.image(600, 300, 'background');
    
    platforms = this.physics.add.staticGroup();

    platforms.create(385, 499, 'ground').setScale(2.2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    this.physics.add.collider(player, platforms);

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    meat = this.physics.add.group({
        key: 'meat',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    meat.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(meat, platforms); // Moved collider outside iterate function
    this.physics.add.overlap(player, meat, collectMeat, null, this); // Moved overlap outside iterate function

    var score = 0;
    var scoreText;

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    // Add meteors and collision logic
    meteor = this.physics.add.group();
    this.physics.add.collider(meteor, platforms);
    this.physics.add.collider(player, meteor, hitMeteor, null, this);
}

function update() {
    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectMeat (player, meat) {
    meat.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (meat.countActive(true) === 0)
        {
            meat.children.iterate(function (child) {
    
                child.enableBody(true, child.x, 0, true, true);
    
            });
    
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
            var meteor = meteor.create(x, 16, 'meteor');
            meteor.setBounce(1);
            meteor.setCollideWorldBounds(true);
            meteor.setVelocity(Phaser.Math.Between(-200, 200), 20);
    
        }
}

function hitMeteor (player, meteor)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
