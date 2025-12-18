<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealIngredient extends Model
{
    use HasFactory;

    protected $table = 'Meal_Ingredients';

    public $timestamps = false;

    protected $fillable = [
        'meal_id',
        'ingredient',
    ];

    public function meal()
    {
        return $this->belongsTo(Meal::class, 'meal_id', 'meal_id');
    }
}

