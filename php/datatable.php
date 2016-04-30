<?php
public static function selectdata($columns, $alias, $table, $joins, $rangefilter, $param_arr = NULL, $where = NULL, $groupby = NULL, $ordertable = NULL)
{
// filtering
$sql_where = "";

if ($_GET['sSearch'] != "") {
$sql_where = "WHERE (";
for ($i = 0; $i < count($columns); $i++) {
if ($_GET['bSearchable_' . $i] == "true") {
if (isset($alias[$columns[$i]]) AND strstr($alias[$columns[$i]], 'GROUP_CONCAT'))
$column = $columns[$i];
elseif (isset($alias[$columns[$i]]))
$column = $alias[$columns[$i]];
else
$column = $columns[$i];

$sql_where .= $column . " LIKE '%" . mysql_real_escape_string($_GET['sSearch']) . "%' OR ";
}
}
$sql_where = substr_replace($sql_where, "", -3);
$sql_where .= ')';
}

// individual column filtering
for ($i = 0; $i < count($columns); $i++) {
if ($_GET['bSearchable_' . $i] == "true" AND $_GET['sSearch_' . $i] != '') {
if ($sql_where == "")
$sql_where = "WHERE ";
else
$sql_where .= " AND ";

if (isset($alias[$columns[$i]]) AND strstr($alias[$columns[$i]], 'GROUP_CONCAT'))
$column = $columns[$i];
elseif (isset($alias[$columns[$i]]))
$column = $alias[$columns[$i]];
else
$column = $columns[$i];

$sql_where .= $column . " LIKE '%" . mysql_real_escape_string($_GET['sSearch_' . $i]) . "%' ";
}
}

// Range Filtering
// Наличие ключа min, max в массиве $_GET
if (array_key_exists('min', $_GET) AND array_key_exists('max', $_GET)) {
$min = ($_GET['min'] == "") ? 0 : $_GET['min'] . " 00:00:00";
$max = ($_GET['max'] == "") ? 999999 : $_GET['max'] . " 23:59:59";
}

// Наличие ключа rangesearch в массиве $_GET
if (array_key_exists('rangesearch', $_GET)) {
if ($_GET['rangesearch'] == 'rangesearch_1' AND isset($rangefilter[0]))
$searchField = $rangefilter[0];
elseif ($_GET['rangesearch'] == 'rangesearch_2' AND isset($rangefilter[1]))
$searchField = $rangefilter[1];
elseif ($_GET['rangesearch'] == 'rangesearch_3' AND isset($rangefilter[2]))
$searchField = $rangefilter[2];

$min = $searchField == 'last_login' ? strtotime($min) : $min;
$max = $searchField == 'last_login' ? strtotime($max) : $max;

if ($sql_where != "" && $_GET['min'] != "" || $sql_where != "" && $_GET['max'] != "")
$sql_where .= " AND $searchField >= '" . $min . "' AND $searchField <= '" . $max . "' ";
elseif ($_GET['min'] != "" || $_GET['max'] != "")
if ($_GET['min'] == $_GET['max']) {
$min_g = $searchField == 'last_login' ? strtotime($_GET['min'] . " 00:00:00") : $_GET['min'] . " 00:00:00";
$max_g = $searchField == 'last_login' ? strtotime($_GET['min'] . " 23:59:59") : $_GET['min'] . " 23:59:59";
$sql_where .= " WHERE $searchField >= '" . $min_g . "' AND $searchField <= '" . $max_g . "' ";
} else
$sql_where .= " WHERE $searchField >= '" . $min . "' AND $searchField <= '" . $max . "' ";
}

// If an optional array of parameters
if ($param_arr != NULL)
foreach ($param_arr as $key => $value)
if ($sql_where == "")
$sql_where = "WHERE $key = '" . $value . "' ";
else
$sql_where .= " AND $key = '" . $value . "' ";

// ordering
$sql_order = "";
if (isset($_GET['iSortCol_0']) AND empty($ordertable)) {
$sql_order = " ORDER BY  ";
for ($i = 0; $i < mysql_real_escape_string($_GET['iSortingCols']); $i++)
$sql_order .= $columns[$_GET['iSortCol_' . $i]] . " " . mysql_real_escape_string($_GET['sSortDir_' . $i]) . ", ";
$sql_order = substr_replace($sql_order, "", -2);
} else
$sql_order = " ORDER BY  " . $ordertable;

// paging
$sql_limit = "";
if (isset($_GET['iDisplayStart']) && $_GET['iDisplayLength'] != '-1')
$sql_limit = "LIMIT " . mysql_real_escape_string($_GET['iDisplayStart']) . ", " . mysql_real_escape_string($_GET['iDisplayLength']);

// alias
$tmp = array();
foreach ($columns as $colname)
$tmp[] = isset($alias[$colname]) ? $alias[$colname] . ' as ' . $colname : $colname;

// custom where
if (!is_null($where))
if ($sql_where == "")
$sql_where = "WHERE $where";
else
$sql_where .= " AND $where";

$groupby_custom = !is_null($groupby) ? $groupby : null;

// main query
$main_query = DB::query(Database::SELECT, "SELECT SQL_CALC_FOUND_ROWS " . implode(", ", $tmp) . " FROM {$table} {$joins} {$sql_where} {$groupby_custom} {$sql_order} {$sql_limit}");
//var_dump($main_query); exit;
$main_query = $main_query->execute()->as_array();

// get the number of filtered rows
$filtered_rows_query = DB::query(Database::SELECT, "SELECT FOUND_ROWS()");

$aResultFilterTotal = $filtered_rows_query->execute()->as_array();
$response['iTotalDisplayRecords'] = intval($aResultFilterTotal[0]["FOUND_ROWS()"]);

// send back the number requested
$response['sEcho'] = intval($_GET['sEcho']);

$response['aaData'] = array();

// finish getting rows from the main query
foreach ($main_query as $aRow) {
$row = array();
for ($i = 0; $i < count($columns); $i++)
if ($columns[$i] != ' ')
$row[] = $aRow[$columns[$i]]; // General output
$response['aaData'][] = $row;
}

return $response;
}