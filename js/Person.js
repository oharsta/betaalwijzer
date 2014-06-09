function Person(name, amount) {
  if (!(this instanceof Person))
    return new Person(name, amount)
  this.name = name;
  this.contribution = new Money(amount);
  this.position = new Money(amount);
};

Person.prototype.minusPosition = function (amount) {
  this.position = this.position.subtract(amount);
};

Person.prototype.isPositionNegative = function () {
  return this.position.amount < 0;
};

Person.prototype.isPositionPositive = function () {
  return this.position.amount > 0;
};

Person.prototype.resetPosition = function() {
  this.position = new Money(this.contribution.amount);
}

Person.prototype.adjustPosition = function(money, isDebit) {
  if (isDebit) {
    this.position = this.position.subtract(money);
  } else {
    this.position = this.position.add(money);
  }
}

Person.prototype.positionEmpty = function() {
  return this.position.amount === 0;
}


