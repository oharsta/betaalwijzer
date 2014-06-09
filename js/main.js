function Controller($scope) {
  $scope.person = {};
  $scope.persons = [];
  $scope.payments = [];
  $scope.positions = {};
  $scope.adjustments = [];
  $scope.step0 = false;
  $scope.step1 = $scope.step2 = $scope.step3 = true;

  $scope.initPersons = function() {
    $scope.Okke = new Person('Okke', '369');
    $scope.Esther = new Person('Esther', '125');
    $scope.Guido = new Person('Guido', '30');
    $scope.Chawa = new Person('Chawa', '0');
    $scope.Paul = new Person('Paul', '0');
    $scope.Trudy =  new Person('Trudy', '50');
    $scope.Astrid =  new Person('Astrid', '0');
    $scope.Roel = new Person('Roel', '127');
    $scope.persons = [$scope.Okke, $scope.Esther, $scope.Guido, $scope.Chawa, $scope.Paul, $scope.Trudy, $scope.Astrid, $scope.Roel];
    $scope.step0 = true;
    $scope.step1 = false;
  }

  $scope.adjustDeviatingPositions = function () {
    /*
     * Okke -50 Esther +50
     * All but Guido (-60 / 7) Esther +60
     * Astrid -12 Esther +12
     */
    singlePayment($scope.Esther, [$scope.Okke], new Money('50'));
    singlePayment($scope.Esther, [$scope.Astrid], new Money('12'));
    var allButGuido = _.filter($scope.persons, function (person) {
      return person.name !== 'Guido';
    });
    singlePayment($scope.Esther, allButGuido, new Money((60 / allButGuido.length).toFixed(2)));
    $scope.step2 = true;
    $scope.step3 = false;
  }


  var aggregatePositions = function () {
    return _.reduce($scope.persons, function (positions, person) {
        positions.totalCredit += person.isPositionPositive() ? person.position.amount : 0;
        positions.totalDebit -= person.isPositionNegative() ? person.position.amount : 0;
        return positions;
      },
      { totalCredit: 0, totalDebit: 0});
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

  var singlePayment = function(creditor, debtors, amount) {
    _.each(debtors, function(debtor){
      debtor.adjustPosition(amount, true);
      $scope.adjustments.push(new Payment(creditor.name, debtor.name, Math.abs(amount.amount)));
    });
    creditor.adjustPosition(amount, false);
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
    $scope.positions = aggregatePositions();
    $scope.step1 = true;
    $scope.step2 = false;
  };

  $scope.doPayments = function () {
    var debtors = $scope.persons.filter(function (person) {
      return person.isPositionNegative();
    });
    var creditors = $scope.persons.filter(function (person) {
      return person.isPositionPositive();
    });
    loopPositions(creditors.pop(), creditors, debtors.pop(), debtors);
  }


}