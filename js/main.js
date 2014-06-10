function Controller($scope) {
  $scope.person = {};
  $scope.persons = [];
  $scope.oddPayments = [];
  $scope.payments = [];
  $scope.positions = {};
  $scope.adjustments = [];
  $scope.step0 = false;
  $scope.step1 = $scope.step2 = true;

  $scope.initPersons = function () {
    
    $scope.Okke = new Person('Okke', '369');
    $scope.Esther = new Person('Esther', '125');
    $scope.Guido = new Person('Guido', '30');
    $scope.Chawa = new Person('Chawa', '0');
    $scope.Paul = new Person('Paul', '0');
    $scope.Trudy = new Person('Trudy', '50');
    $scope.Astrid = new Person('Astrid', '0');
    $scope.Roel = new Person('Roel', '127');
    $scope.persons = [$scope.Okke, $scope.Esther, $scope.Guido, $scope.Chawa, $scope.Paul, $scope.Trudy, $scope.Astrid, $scope.Roel];

    /*
     * Okke -50 Esther +50
     * All but Guido (-60 / 7) Esther +60 - present twins
     * Astrid -12 Esther +12
     */
    $scope.oddPayments.push({ from: $scope.Esther, to: [$scope.Okke], what: new Money('50'), total: 50.00 });
    $scope.oddPayments.push({ from: $scope.Esther, to: [$scope.Astrid], what: new Money('12'), total: 12.00 });
    var allButGuido = _.filter($scope.persons, function (person) {
      return person.name !== 'Guido';
    });
    $scope.oddPayments.push( { from: $scope.Esther, to: allButGuido, what: new Money((60 / allButGuido.length).toFixed(2)), total: 60.00 });

    $scope.step0 = true;
    $scope.step1 = false;
  }

  var adjustDeviatingPositions = function () {
    _.each($scope.oddPayments, function(oddPayment){
      singlePayment(oddPayment.from, oddPayment.to, oddPayment.what);
    });
  }

  var singlePayment = function (creditor, debtors, amount) {
    _.each(debtors, function (debtor) {
      debtor.adjustPosition(amount, true);
      $scope.adjustments.push({ from: debtor.name, to: creditor.name, amount: Math.abs(amount.format())});
    });
    creditor.adjustPosition(amount.multiple(debtors.length), false);
  }

  var aggregatePositions = function () {
    var pos = _.reduce($scope.persons, function (positions, person) {
        positions.totalCredit += person.isPositionPositive() ? person.position.amount : 0;
        positions.totalDebit -= person.isPositionNegative() ? person.position.amount : 0;
        return positions;
      },
      { totalCredit: 0, totalDebit: 0});
    return { totalCredit: (pos.totalCredit / 100).toFixed(2), totalDebit: (pos.totalDebit / 100).toFixed(2)}
  }

  var resetPositions = function () {
    _.each($scope.persons, function (person) {
      person.resetPosition();
    });
  }

  var loopPositions = function (creditor, creditors, debtor, debtors) {
    createPayment(creditor, debtor);
    if (creditor.positionEmpty()) {
      var nextCreditor = creditors.pop();
      creditor = (nextCreditor !== undefined) ? nextCreditor : creditor;
    }
    if (debtor.positionEmpty()) {
      var nextDebtor = debtors.pop();
      debtor = (nextDebtor !== undefined) ? nextDebtor : debtor;
    }
    if (nextCreditor === undefined && nextDebtor === undefined) {
      return true;
    }
    loopPositions(creditor, creditors, debtor, debtors);
  }

  var createPayment = function (creditor, debtor) {
    var minMoney = Money.min(creditor.position, debtor.position);
    $scope.payments.push(new Payment(creditor.name, debtor.name, new Money(minMoney.amount)));
    creditor.adjustPosition(minMoney, true);
    debtor.adjustPosition(minMoney, false);
  }

  $scope.add = function (person) {
    $scope.persons.push(new Person(person.name, person.contribution));
    $scope.person = {};
  };

  $scope.crunch = function () {
    resetPositions();
    var persons = _($scope.persons);
    persons.each(function (subject) {
      persons.each(function (person) {
        var delta = subject.contribution.divide(persons.size());
        person.minusPosition(delta);
      });
    });
    $scope.persons = persons.value();
    adjustDeviatingPositions();
    $scope.positions = aggregatePositions();
    $scope.step1 = true;
    $scope.step2 = false;
  };

  $scope.doPayments = function () {
    var debtors = _.filter($scope.persons, function (person) {
      return person.isPositionNegative();
    });

    var creditors = _.filter($scope.persons, function (person) {
      return person.isPositionPositive();
    });

    debtors = _.sortBy(debtors, function(person){
      return person.position.amount;
    });

    creditors = _.sortBy(creditors, function(person){
      return person.position.amount;
    });

    loopPositions(creditors.pop(), creditors, debtors.pop(), debtors);
    $scope.step3 = true;
  }


}