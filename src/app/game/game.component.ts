import { Component, AfterViewInit, HostListener, Injectable, ViewChild, ElementRef } from '@angular/core';

import * as _ from 'lodash';
import * as $ from 'jquery';
import { NgxSmartModalService } from 'ngx-smart-modal';

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  SPACE_BAR = 32
}


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})

@Injectable({
  providedIn: 'root'
})


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
    'rock2': '../assets/img/rock_2.png'
  };
  obstacleTypes = ['tree', 'treeCluster', 'rock1', 'rock2'];

  skier = {
    direction: <number>5,
    mapX: <number>0,
    mapY: <number>0,
    speed: <number>8
  };


  obstacles = [];
  loadedAssets = [];
  gameWidth = window.innerWidth;
  gameHeight = window.innerHeight;

  context: CanvasRenderingContext2D;

  @ViewChild('myCanvas') myCanvas: ElementRef;

  constructor(ngxSmartModalService: NgxSmartModalService) { }

  @HostListener('window:load')
  load() {
    this.render();
  }
  render() {
    const canvas = this.myCanvas.nativeElement;
    this.context = canvas.getContext('2d');
    this.init();
    const self = this;
  }

  ngAfterViewInit(): void {
    $('canvas')
    .attr('width', this.gameWidth * window.devicePixelRatio)
    .attr('height', this.gameHeight * window.devicePixelRatio)
    .css({
        width: this.gameWidth + 'px',
        height: this.gameHeight + 'px'
    });
  }

  afterLoading(): void {
    
  }

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

  placeRandomObstacle(minX, maxX, minY, maxY): void {
    const obstacleIndex = _.random(0, this.obstacleTypes.length - 1);

    const position = this.calculateOpenPosition(minX, maxX, minY, maxY);

    this.obstacles.push({
      type: this.obstacleTypes[obstacleIndex],
      x: position.x,
      y: position.y
    });
  }

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

  getAsset(): string {
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

  drawSkier(): void {
    const skierAssetName = this.getAsset();
    const skierImage = this.loadedAssets[skierAssetName];
    const x = Math.round((this.gameWidth - skierImage.width) / 2);
    const y = Math.round((this.gameHeight - skierImage.height) / 2);

    this.context.drawImage(skierImage, x, y, skierImage.width, skierImage.height);
    // this.context.save();
  }

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

  checkIfSkierHitObstacle(): void {
    const skierAssetName = this.getAsset();
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
        bottom: obstacle.y + obstacleImage.height
      };

      return self.intersectRect(skierRect, obstacleRect);
    });

    if (collision) {
      this.skier.direction = 0;
      this.skier.speed = 8;
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

  @HostListener('window:keyup', ['$event'])

  keyEvent(event: KeyboardEvent) {
    switch (event.keyCode) {
      case KEY_CODE.LEFT_ARROW: // left
        if (this.skier.direction === 1) {
          this.skier.mapX -= this.skier.speed;
          this.placeNewObstacle(this.skier.direction);
        } else {
          if(this.skier.direction !== 0) {
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
        
        break;
    }
  }

  gameLoop(): void {
    this.context.save();

    // Retina support
    this.context.scale(window.devicePixelRatio, window.devicePixelRatio);

    this.clearCanvas();

    this.moveSkier();

    this.checkIfSkierHitObstacle();

    this.drawSkier();

    this.drawObstacles();

    this.context.restore();

    requestAnimationFrame(() => this.gameLoop());

   
  }

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
