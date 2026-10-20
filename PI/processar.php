@ -0,0 +1,38 @@
<?php
// captura os dados 
$dataHora = date('Y-m-d H:i:s');
$nome = $_REQUEST['nome'];
$email = $_REQUEST['email'];
$senha = $_REQUEST['senha'];


$servername = "localhost";
$username = "root";
$password = "";
$dbname = "cadastro_formulario";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "INSERT INTO formulario (dataHora, email,nome, senha) VALUES ('".$dataHora."','".$email."', '".$nome."' ,'".$senha."')";

if ($conn->query($sql) === TRUE) {
    header('Location: ../forms.html');
   $conn->close();
   exit();
} else {
  echo "Error: " . $sql . "<br>" . $conn->error;
  $conn->close();
}


?>



echo 'Oi_'.$nome;
?>
