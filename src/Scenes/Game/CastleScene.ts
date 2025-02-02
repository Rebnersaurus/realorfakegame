import { GameObjects, Tilemaps } from "phaser";

// import themeSongUrl from "../../Assets/Audio/theme.mp3";
import AnimatedTiles from "phaser-animated-tiles-phaser3.5/dist/AnimatedTiles.min.js";
import playerSpriteSheetUrl from "../../Assets/SpriteSheets/mage_f.png";
import playerSpriteUrl from "../../Assets/Sprites/player.png";
import tileMapJsonUrl from "../../Assets/Tilemaps/Castle/Castle.json?url";

import { Dialog } from "../../Classes/Dialog";
import castleTilesPngUrl from "../../Assets/Tilemaps/Tiles/Castle2.png";
import interiorsTilesPngUrl from "../../Assets/Tilemaps/Tiles/interiors.png";
import furnitureTilesPngUrl from "../../Assets/Tilemaps/Tiles/furniture.png";
import decorationsTilesPngUrl from "../../Assets/Tilemaps/Tiles/decorative_props.png";
import { Player } from "../../Classes/Player";

export default class CastleScene extends Phaser.Scene {
  constructor() {
    super("castle-scene");
  }
  private map!: Tilemaps.Tilemap;
  private player!: Player;
  private animatedTiles!: AnimatedTiles;

  private groundlayer!: Tilemaps.TilemapLayer;
  private waterlayer!: Tilemaps.TilemapLayer;
  private dynamiclayer!: Tilemaps.TilemapLayer;
  private interiorlayer!: Tilemaps.TilemapLayer;
  private collidingobjectslayer!: Tilemaps.TilemapLayer;
  private toplayer!: Tilemaps.TilemapLayer;
  private noncollidingobjectslayer!: Tilemaps.TilemapLayer;
  private noncollidinghigherlayer!: Tilemaps.TilemapLayer;
  private orust!: GameObjects.GameObject;

  preload() {
    this.cameras.main.setBackgroundColor("#FFFFFF");
    //Load tilemap
    this.load.tilemapTiledJSON("CastleTilemap", tileMapJsonUrl);
    //Load player
    this.load.image("player", playerSpriteUrl);
    // this.load.audio("music", themeSongUrl);
    this.load.spritesheet("playerspritesheet", playerSpriteSheetUrl, {
      frameWidth: 32,
      frameHeight: 36,
    });

    //Load tileset
    this.load.image("castletiles", castleTilesPngUrl);
    this.load.image("interiortiles", interiorsTilesPngUrl);
    this.load.image("furnituretiles", furnitureTilesPngUrl);
    this.load.image("decorativetiles", decorationsTilesPngUrl);
  }

  create() {
    this.player = new Player(this, 680, 450);
    this.initMap();
    // this.initMusic();
    // this.initCollidingActions();
    this.initCollidingActions();
    const dialog = new Dialog("You have entered a mysterious house!");
    this.scene.get('orust-scene').events.on('player-enter-house', () => {
      this.player.setX(this.orust.body.position.x);
      this.player.setY(this.orust.body.position.y-50)
    });
  }

  update() {
    this.player.updatePlayer();
  }

  private initMusic(): void {
    const music = this.sound.add("music");
    music.play();
  }

  private initMap(): void {
    //add the tilemap
    this.map = this.add.tilemap("CastleTilemap");
    //add the tileset
    this.map.addTilesetImage("Castle2", "castletiles");
    this.map.addTilesetImage("HouseInterior", "interiortiles");
    this.map.addTilesetImage("HouseFurniture", "furnituretiles");
    this.map.addTilesetImage("HouseDecorations", "decorativetiles");
    //create the layer
    this.groundlayer = this.map.createLayer("Ground", "Castle2", 0, 0);
    this.collidingobjectslayer = this.map.createLayer(
      "Collision",
      ["Castle2", "HouseInterior", "HouseFurniture", "HouseDecorations"],
      0,
      0
    );
    // this.interiorlayer = this.map.createLayer("Interior", "HouseInterior", 0, 0);
    // this.toplayer.setDepth(200);
    this.map.setCollisionBetween(1, 10000, true, false, "Collision");
    this.physics.add.collider(this.player, this.collidingobjectslayer);
  }

  private initCollidingActions(): void {
    const objects = this.map.createFromObjects("Interactive", {
      name: "orust",
    });

    const orust = objects[0];
    //make the object transparent

    if (orust) {
      this.orust = orust;
      this.physics.world.enable(orust);
      orust.removeFromDisplayList();
      //alert when the player collides with the orust collider
      this.physics.add.overlap(this.player, orust, () => {
        this.events.emit('player-exit-house');
        this.scene.switch("orust-scene");
      });
    }
  }
}
