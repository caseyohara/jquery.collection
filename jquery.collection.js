(function($) {
  $.fn.collection = function(options) {
    var $table = $(this);
    var $thead = $table.find('thead');
    var $tbody = $table.find('tbody');
    var $rows =  $tbody.find('tr').clone();
    var $sortableColumns   = $thead.find('[data-sortable]');
    var $searchableColumns = $thead.find('[data-searchable]');
    var $filterableColumns = $thead.find('[data-filterable]');

    var filterableColumnIndex = $filterableColumns.first().index();
    var searchableColumnIndexes = $searchableColumns.map(function(index) { return $(this).index() }).toArray();

    // search input
    var $search = options.$search;

    // `conditions` is a mutable object that gets passed to the `apply()` function,
    // effectively passed through to `search()`, `filter()`, and `sort()` functions
    var conditions = {
      sort: {
        column: 0,
        order: 1,
        fn: function(value) { return value }
      },

      filter: {
        column: filterableColumnIndex,
        value: ''
      },

      search: {
        columns: searchableColumnIndexes,
        value: ''
      }
    };

    //
    // bind events for sorting, filtering and searching.
    //
    // when an event is triggered, these functions mutate the conditions object,
    // clone the original rows, and pass the conditions and rows to `apply()`.
    // `apply()` doesn't perform any mutation; it simply returns a new set of rows
    // to be injected into the html
    //
    $search.keyup(function() {
      conditions.search.value = $(this).val();
      replace(apply($rows.clone(), conditions));
    });

    $sortableColumns.click(function(event) {
      event.preventDefault();
      conditions.sort.order *= -1;
      conditions.sort.column = $(this).index();
      conditions.sort.fn = window[$(this).data("sort-type")] || function(value) { return value };
      replace(apply($rows.clone(), conditions));
    });

    // updates the html of the table with a new set of rows
    function replace($results) {
      $tbody.html($results);
    }

    return this;
  };

  function apply($results, conditions) {
           $results = search($results, conditions.search);
           $results = filter($results, conditions.filter);
           $results = sort($results, conditions.sort);
    return $results;
  }

  function search($rows, conditions) {
    var value = conditions.value.toLowerCase().replace(/[^0-9a-z]/ig, '');

    if (value == "") {
      return $rows;
    }

    return $rows.filter(function(index) {
      var $cells = $(this).find('td,th').filter(function() {
        return -1 != $.inArray($(this).index(), conditions.columns);
      });

      return -1 != $.inArray(true,
        $cells.map(function() {
          var text = ($(this).text() || "").toLowerCase().replace(/[^0-9a-z]/ig, '');
          return text.indexOf(value) !== -1;
        })
      )
    })
  }

  function filter($rows, conditions) {
    if (conditions.value == "") {
      return $rows;
    }

    return $rows.filter(function() {
      var $cell = $(this).find('td,th').eq(conditions.column);
      var text = $cell.text() || "";
      return text.charAt(0).toLowerCase() == conditions.value;
    });
  }

  function sort($rows, conditions) {
    return $rows.sort(function(a,b) {
      a = conditions.fn($(a).find('td').eq(conditions.column).text());
      b = conditions.fn($(b).find('td').eq(conditions.column).text());
      if (conditions.order == 1) {
        return a > b ? 1 : -1;
      }
      else {
        return a < b ? 1 : -1;
      }
    })
  }

}(jQuery));
