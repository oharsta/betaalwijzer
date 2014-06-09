function Payment(creditor, debtor, amount) {
  if (!(this instanceof Payment))
    return new Payment(creditor, debtor, amount)
  this.creditor = creditor;
  this.debtor = debtor;
  this.amount = amount;
};
