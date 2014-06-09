// Do not use this code in production;-)

function Money() {

  if (!(this instanceof Money)) {
    return new Money(arguments);
  }

  if (arguments.length == 0) {
    throw new Error('Money needs either String amount representation or Number')
  }

  if (typeof arguments[0] === 'string') {

    var split = arguments[0].split('.');
    var eurosInCents = Number(split[0]) * 100;
    var cents = (split[1] === undefined) ? 0 : split[1].trim().lenght === 1 ? (Number(split[1]) * 10) : (Number(split[1].substring(0, 2)));

    this.amount = eurosInCents + cents;
    this.amountFormatted = this.format();
  } else {
    this.amount = arguments[0];
    this.amountFormatted = this.format();
  }

}

Money.min = function(money, otherMoney) {
  var smallest = Math.abs(money.amount) < Math.abs(otherMoney.amount) ? money : otherMoney;
  return new Money(Math.abs(smallest.amount));
};

Money.prototype.add = function (money) {
  return new Money(this.amount + money.amount);
};

Money.prototype.subtract = function (money) {
  return new Money(this.amount - money.amount);
};

Money.prototype.divide = function (number) {
  return new Money((this.amount / number / 100).toFixed(2));
};

Money.prototype.multiple = function (number) {
  return new Money(((this.amount * number) / 100).toFixed(2));
};

Money.prototype.format = function () {
  return (this.amount / 100).toFixed(2)
};
