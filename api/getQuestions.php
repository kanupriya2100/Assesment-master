<?

function getQuestion($body,$netId,$survey,$id){
global $permissions;
global $path;

if($_SERVER["cn"]==$netId || $permissions["superUser"]){

$structure = $path."/data/".$netId."/".$survey."/".$id.".json";

if(file_exists($structure)){

  $question = file_get_contents($structure);
  print_r($question);

}else{

  file_put_contents($structure,$body);
  $question = file_get_contents($structure);
  print_r($question);

}

}

}
?>
