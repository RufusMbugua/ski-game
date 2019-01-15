import { Component, AfterViewInit, HostListener, Injectable, ViewChild, ElementRef } from '@angular/core';

import * as _ from 'lodash';
import * as $ from 'jquery';
// import { NgxSmartModalService } from 'ngx-smart-modal';
import {LocalStorageService} from 'ngx-localstorage';

/** */
export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  SPACE_BAR = 32
}

/**
 * Component Declaration
 */
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})


@Injectable({
  providedIn: 'root'
})

/**
 * GameComponent Class
 */
export class GameComponent implements AfterViewInit {

  assetImages = {
    'skierCrash': '../assets/img/skier_crash.png',
    'skierLeft': '../assets/img/skier_left.png',
    'skierLeftDown': '../assets/img/skier_left_down.png',
    'skierDown': '../assets/img/skier_down.png',
    'skierRightDown': '../assets/img/skier_right_down.png',
    'skierRight': '../assets/img/skier_right.png',
    'tree': '../assets/img/tree_1.png',
    'treeCluster': '../assets/img/tree_cluster.png',
    'rock1': '../assets/img/rock_1.png',
    'rock2': '../assets/img/rock_2.png',
    'jumpRamp': '../assets/img/jump_ramp.png',
    'skierJump1': '../assets/img/skier_jump_1.png',
    'skierJump2': '../assets/img/skier_jump_2.png',
    'skierJump3': '../assets/img/skier_jump_3.png',
    'skierJump4': '../assets/img/skier_jump_4.png',
    'skierJump5': '../assets/img/skier_jump_5.png',
    'rhinoLift': '../assets/img/rhino_lift.png',
    'rhinoLiftOpenMouth': '../assets/img/rhino_lift_mouth_open.png',
    'rhinoLiftEat1': '../assets/img/rhino_lift_eat_1.png',
    'rhinoLiftEat2': '../assets/img/rhino_lift_eat_2.png',
    'rhinoLiftEat3': '../assets/img/rhino_lift_eat_3.png',
    'rhinoLiftEat4': '../assets/img/rhino_lift_eat_4.png'
  };
  obstacleTypes = ['tree', 'treeCluster', 'rock1', 'rock2', 'jumpRamp'];

  /**
   * The Skier Object
   *
   * @return  {Object}  [return description]
   */
  skier = {
    direction: <number>5,
    mapX: <number>0,
    mapY: <number>0,
    speed: <number>4,
    jump: <boolean>false,
    animation: <number>0
  };

  /**
   * The Rhino Object
   *
   * @return  {[type]}  [return description]
   */
  rhino = {
    animation: <number>0,
    direction: <number>5,
    mapX: <number>0,
    mapY: <number>0,
    speed: <number>9
  };


  obstacles = [];
  loadedAssets = [];
  gameWidth = window.innerWidth;
  gameHeight = window.innerHeight;
  score = 0;
  shouldSave = <boolean> false;

  /**
   * Context for the Canvas Render
   *
   * @return  {Element}  [return description]
   */
  context: CanvasRenderingContext2D;

  @ViewChild('myCanvas') myCanvas: ElementRef;

  constructor(private _storageService: LocalStorageService) { }

  /**
   * Rendering game on load
   */
  @HostListener('window:load')
  load() {
    this.render();
  }
  render() {
    const canvas = this.myCanvas.nativeElement;
    this.context = canvas.getContext('2d');
    this.init();
  }

  /**
   * Set game dimensions on inititalization
   *
   * @return  {void}  [return description]
   */
  ngAfterViewInit(): void {
    $('canvas')
    .attr('width', this.gameWidth * window.devicePixelRatio)
    .attr('height', this.gameHeight * window.devicePixelRatio)
    .css({
        width: this.gameWidth + 'px',
        height: this.gameHeight + 'px'
    });
  }

  /**
   * Load the assets / images used in the game
   *
   * @return  {Promise<string>}  A promise with the loaded assests
   */
  loadAssets(): Promise<string> {
    const assetPromises = [];
    const self = this;
    _.each(this.assetImages, function (asset, assetName) {
      const assetImage = new Image();
      const assetDeferred = $.Deferred();

      assetImage.onload = function () {
        assetImage.width /= 2;
        assetImage.height /= 2;

        self.loadedAssets[assetName] = assetImage;
        assetDeferred.resolve();
      };
      assetImage.src = asset;

      assetPromises.push(assetDeferred.promise());
    });

    return $.when.apply($, assetPromises);
  }

  /**
   * Place fist obstacles in the game
   *
   * @return  {void}  [return description]
   */
  placeInitialObstacles(): void {
    const numberObstacles = Math.ceil(_.random(5, 7) * (this.gameWidth / 800) * (this.gameHeight / 500));
    const minX = -50;
    const maxX = this.gameWidth + 50;
    const minY = this.gameHeight / 2 + 100;
    const maxY = this.gameHeight + 50;
    const self = this;

    for (let i = 0; i < numberObstacles; i++) {
      this.placeRandomObstacle(minX, maxX, minY, maxY);
    }

    this.obstacles = _.sortBy(this.obstacles, function (obstacle) {
      const obstacleImage = self.loadedAssets[obstacle.type];
      return obstacle.y + obstacleImage.height;
    });
  }

  /**
   * Place a new obstacle in the game
   *
   * @param   {integer}  direction  [direction description]
   *
   * @return  {void}               [return description]
   */
  placeNewObstacle(direction): void {
    const shouldPlaceObstacle = _.random(1, 8);
    if (shouldPlaceObstacle !== 8) {
      return;
    }

    const leftEdge = this.skier.mapX;
    const rightEdge = this.skier.mapX + this.gameWidth;
    const topEdge = this.skier.mapY;
    const bottomEdge = this.skier.mapY + this.gameHeight;

    switch (direction) {
      case 1: // left
        this.placeRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge);
        break;
      case 2: // left down
        this.placeRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge);
        this.placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
        break;
      case 3: // down
        this.placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
        break;
      case 4: // right down
        this.placeRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge);
        this.placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
        break;
      case 5: // right
        this.placeRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge);
        break;
      case 6: // up
        this.placeRandomObstacle(leftEdge, rightEdge, topEdge - 50, topEdge);
        break;
    }
  }

  /**
   * Place an onstacle in a random position. Implements placeNewObstacle
   *
   * @param   {integer}  minX  [minX description]
   * @param   {integer}  maxX  [maxX description]
   * @param   {integer}  minY  [minY description]
   * @param   {integer}  maxY  [maxY description]
   *
   * @return  {void}          [return description]
   */
  placeRandomObstacle(minX, maxX, minY, maxY): void {
    const obstacleIndex = _.random(0, this.obstacleTypes.length - 1);

    const position = this.calculateOpenPosition(minX, maxX, minY, maxY);

    this.obstacles.push({
      type: this.obstacleTypes[obstacleIndex],
      x: position.x,
      y: position.y
    });
  }

  /**
   * Calculates a new position with no obstacle
   *
   * @param   {integer}  minX  [minX description]
   * @param   {integer}  maxX  [maxX description]
   * @param   {integer}  minY  [minY description]
   * @param   {integer}  maxY  [maxY description]
   *
   * @return  {any}           [return description]
   */
  calculateOpenPosition(minX, maxX, minY, maxY): any {
    const x = _.random(minX, maxX);
    const y = _.random(minY, maxY);

    const foundCollision = this.obstacles.find(function (obstacle) {
      return x > (obstacle.x - 50) && x < (obstacle.x + 50) && y > (obstacle.y - 50) && y < (obstacle.y + 50);
    });

    if (foundCollision) {
      return this.calculateOpenPosition(minX, maxX, minY, maxY);
    } else {
      return {
        x: x,
        y: y
      };
    }
  }

  /**
   * Move the skier depending on the skier direction
   *
   * @return  {void}  [return description]
   */
  moveSkier(): void {
    switch (this.skier.direction) {
      case 2:
        this.skier.mapX -= Math.round(this.skier.speed / 1.4142);
        this.skier.mapY += Math.round(this.skier.speed / 1.4142);

        this.placeNewObstacle(this.skier.direction);
        break;
      case 3:
        this.skier.mapY += this.skier.speed;

        this.placeNewObstacle(this.skier.direction);
        break;
      case 4:
        this.skier.mapX += this.skier.speed / 1.4142;
        this.skier.mapY += this.skier.speed / 1.4142;

        this.placeNewObstacle(this.skier.direction);
        break;
    }
  }

  /**
   * Calculate a running total
   *
   * @return  {void}  [return description]
   */
  calculateScore(): void {
      this.score += 1 ;
  }

  /**
   * Save the score in the
   *
   * @return  {void}  [return description]
   */
  saveScore(): void {
    if (this.shouldSave) {
      this._storageService.set(_.toString(_.now()), _.toString(this.score));
      this.score = 0;
      this.shouldSave = false;
    }
  }

  moveRhino(): void {
    switch (this.rhino.direction) {
      case 2:
        this.rhino.mapX -= Math.round(this.rhino.speed / 1.4142);
        this.rhino.mapY += Math.round(this.rhino.speed / 1.4142);

        this.placeNewObstacle(this.rhino.direction);
        break;
      case 3:
        this.rhino.mapY += this.rhino.speed;

        this.placeNewObstacle(this.rhino.direction);
        break;
      case 4:
        this.rhino.mapX += this.rhino.speed / 1.4142;
        this.rhino.mapY += this.rhino.speed / 1.4142;

        this.placeNewObstacle(this.rhino.direction);
        break;
    }
  }

  /**
   * Get the Skier Image based in the skier direction
   *
   * @return  {string}  The name of the asset
   */
  getSkierAsset(): string {
    let skierAssetName = '';

    switch (this.skier.direction) {
      case 0:
        skierAssetName = 'skierCrash';
        break;
      case 1:
        skierAssetName = 'skierLeft';
        break;
      case 2:
        skierAssetName = 'skierLeftDown';
        break;
      case 3:
        skierAssetName = 'skierDown';
        break;
      case 4:
        skierAssetName = 'skierRightDown';
        break;
      case 5:
        skierAssetName = 'skierRight';
        break;
    }

    return skierAssetName;
  }

  /**
   * Get the Rhino Image based in the skier direction
   *
   * @return  {string}  [return description]
   *
   * TODO:
   * - Add Rhino to game
   */
  getRhinoAsset(): string {
    let rhinoAssetName = '';
    switch (this.rhino.animation) {
      case 0:
        rhinoAssetName = 'rhinoLift';
        break;
      case 1:
        rhinoAssetName = 'rhinoLiftOpenMouth';
        break;
      case 2:
        rhinoAssetName = 'rhinoLiftEat1';
        break;
      case 3:
        rhinoAssetName = 'rhinoLiftEat2';
        break;
      case 4:
        rhinoAssetName = 'rhinoLiftEat2';
        break;
      case 5:
        rhinoAssetName = 'rhinoLiftEat3';
        break;
      case 5:
        rhinoAssetName = 'rhinoLiftEat4';
        break;
    }

    return rhinoAssetName;
  }

  /**
   * Get the Skier Image of them jumping
   *
   * @return  {string}  The name of the image
   */
  getJumpAsset(): string {
    let skierAssetName = '';
    switch (Math.floor(this.skier.animation / 10)) {
      case 0:
        skierAssetName = 'skierJump1';
        break;
      case 1:
        skierAssetName = 'skierJump2';
        break;
      case 2:
        skierAssetName = 'skierJump3';
        break;
      case 3:
        skierAssetName = 'skierJump4';
        break;
      case 4:
        skierAssetName = 'skierJump5';
        this.skier.jump = false;
        this.skier.animation = 0;
        break;
    }

    return skierAssetName;
  }

  /**
   * Animate the skier jumping or skiing
   *
   * @return  {void}  [return description]
   */
  drawSkier(): void {
    let skierAssetName = '';
    if (this.skier.jump) {
       skierAssetName = this.getJumpAsset();
       this.skier.animation += 1;
    } else {
       skierAssetName = this.getSkierAsset();
    }


    const skierImage = this.loadedAssets[skierAssetName];
    const x = Math.round((this.gameWidth - skierImage.width) / 2);
    const y = Math.round((this.gameHeight - skierImage.height) / 2);

    this.context.drawImage(skierImage, x, y, skierImage.width, skierImage.height);
    // this.context.save();
  }

  /**
   * Add the obstacles to the game
   *
   * @return  {void}  [return description]
   */
  drawObstacles(): void {
    const newObstacles = [];
    const self = this;
    _.each(this.obstacles, function (obstacle) {
      const obstacleImage = self.loadedAssets[obstacle.type];
      const x = obstacle.x - self.skier.mapX - obstacleImage.width / 2;
      const y = obstacle.y - self.skier.mapY - obstacleImage.height / 2;

      if (x < -100 || x > self.gameWidth + 50 || y < -100 || y > self.gameHeight + 50) {
        return;
      }

      self.context.drawImage(obstacleImage, x, y, obstacleImage.width, obstacleImage.height);

      newObstacles.push(obstacle);
    });

    this.obstacles = newObstacles;
  }

  /**
   * Check if the Skier has hit an obstacle
   *
   * @return  {void}  [return description]
   */
  checkIfSkierHitObstacle(): void {
    const skierAssetName = this.getSkierAsset();
    const skierImage = this.loadedAssets[skierAssetName];
    const skierRect = {
      left: this.skier.mapX + this.gameWidth / 2,
      right: this.skier.mapX + skierImage.width + this.gameWidth / 2,
      top: this.skier.mapY + skierImage.height - 5 + this.gameHeight / 2,
      bottom: this.skier.mapY + skierImage.height + this.gameHeight / 2
    };
    const self = this;
    const collision = _.find(this.obstacles, function (obstacle) {
      const obstacleImage = self.loadedAssets[obstacle.type];
      const obstacleRect = {
        left: obstacle.x,
        right: obstacle.x + obstacleImage.width,
        top: obstacle.y + obstacleImage.height - 5,
        bottom: obstacle.y + obstacleImage.height,
        type: obstacle.type
      };

      if (self.intersectRect(skierRect, obstacleRect)) {
        if (obstacleRect.type === 'jumpRamp') {
          self.skier.jump = true;
        }
        return true;
      } else {
        return false;
      }
    });

    if (collision && !self.skier.jump) {
        this.skier.direction = 0;
        this.skier.speed = 8;
        this.shouldSave = true;
        return;
    } else {
      this.calculateScore();
    }
  }

  intersectRect(r1, r2): boolean {
    return !(r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top);
  }
  clearCanvas(): void {
    this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
  }

  /**
   * Bind Keyboard Inputs to the Skier's behaviour
   * @param event
   */
  @HostListener('window:keyup', ['$event'])

  keyEvent(event: KeyboardEvent) {
    switch (event.keyCode) {
      case KEY_CODE.LEFT_ARROW: // left
        if (this.skier.direction === 1) {
          this.skier.mapX -= this.skier.speed;
          this.placeNewObstacle(this.skier.direction);
        } else {
          if (this.skier.direction !== 0) {
            this.skier.direction--;
          }
        }
        event.preventDefault();
        break;
      case KEY_CODE.RIGHT_ARROW: // right
        if (this.skier.direction === 5) {
          this.skier.mapX += this.skier.speed;
          this.placeNewObstacle(this.skier.direction);
        } else {
          this.skier.direction++;
        }
        event.preventDefault();
        break;
      case KEY_CODE.UP_ARROW: // up
        if (this.skier.direction === 1 || this.skier.direction === 5) {
          this.skier.mapY -= this.skier.speed;
          this.placeNewObstacle(6);
        }
        event.preventDefault();
        break;
      case KEY_CODE.DOWN_ARROW: // down
        this.skier.direction = 3;
        event.preventDefault();
        break;
      case KEY_CODE.SPACE_BAR:
        alert('Game paused');
        break;
    }
  }

  // Sequence of events called every frame
  gameLoop(): void {
    this.context.save();

    // Speed up with every frame
    this.skier.speed += 0.05;

    // Retina support
    this.context.scale(window.devicePixelRatio, window.devicePixelRatio);

    this.clearCanvas();

    this.moveSkier();

    this.checkIfSkierHitObstacle();

    // this.saveScore();

    this.drawSkier();

    this.drawObstacles();

    this.context.restore();

    requestAnimationFrame(() => this.gameLoop());


  }

  /**
   * Start the gameloop
   *
   * @return  {void}  [return description]
   */
  init(): void {
    const self = this;

    this.loadAssets().then(function () {
      self.placeInitialObstacles();
      requestAnimationFrame(() => self.gameLoop());
    }).catch(function (err) {
      console.log(err);
    });
  }

}
