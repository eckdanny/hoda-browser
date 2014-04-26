"use strict";angular.module("hodaApp",["ngRoute","pasvaz.bindonce","ngAnimate"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/character",{templateUrl:"views/characters.html",controller:"CharactersCtrl",resolve:{data:["characterdata",function(a){return a.get()}]}}).otherwise({redirectTo:"/"})}]).controller("AppCtrl",["$scope","$location",function(a,b){a.links=[{path:"#/",name:"Home",match:/^\/$/,active:!1,order:100},{path:"#/character",name:"Characters",match:/^\/character(s?)/,active:!1,order:300}],a.setActive=function(){a.links.some(function(a){a.active=a.match.test(b.path())?!0:!1})},a.$on("$routeChangeSuccess",function(){a.setActive()})}]),angular.module("hodaApp").controller("MainCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("hodaApp").filter("startFrom",function(){return function(a,b){return b=+b,a.slice(b)}}).filter("speedToText",function(){var a={1:"Slow",2:"Medium",3:"Quick"};return function(b){var c;return b=b||"",c=a[b]?a[b]:""}}).controller("CharactersCtrl",["$scope","data",function(a,b){a.charactersFiltered,a.characters=b.data,a.predicate="name",a.showNum=15,a.currentPage=0,a.numberOfPages=function(){return a.charactersFiltered?Math.ceil(a.charactersFiltered.length/a.showNum):0},a.advance=function(){a.currentPage<a.numberOfPages()-1&&(a.currentPage=a.currentPage+1)},a.retreat=function(){0<a.currentPage&&(a.currentPage=a.currentPage-1)},a.search={},a.myListFilter={inList:!0},a.activeFilter=a.search,a.setActiveFilter=function(b){a[b]&&(a.activeFilter=a[b])},a.getPower=function(a,b,c){var d=c-1;return a=a>b.maxLevel[d]?b.maxLevel[d]:a,b.basePower[d]+b.delPower[d]*(a-1)},a.getHealth=function(a,b,c){var d=c-1;return a=a>b.maxLevel[d]?b.maxLevel[d]:a,b.baseHealth[d]+b.delHealth[d]*(a-1)}}]),angular.module("hodaApp").factory("characterdata",["$http",function(a){function b(){return a.get("/data/characters.json")}return{get:b}}]);