<?php
	for($barcodeid = 1 ; $barcodeid<=15;$barcodeid++){

        $code = str_pad($barcodeid, 13, '0', STR_PAD_LEFT);
 ?>
 		<html>
		<head>
		<title>barcode.php qr code test</title>
		<style>
			body {
				font-family: Helvetica, sans-serif;
				padding: 1em;
			}
		</style>
		</head>
		<body>

		<p><img src="barcode.php?s=ean128&d=<?php echo $code; ?>"></p>

		</body>
		</html>
 <?php
        
    }

?>


