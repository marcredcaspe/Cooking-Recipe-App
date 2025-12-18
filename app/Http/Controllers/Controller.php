<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

abstract class Controller
{
    public function randomMeal()
    {
        $response = Http::get('https://www.themealdb.com/api/json/v1/1/random.php');

        return $response->json();
    }
}
