<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealStep extends Model
{
    use HasFactory;

    protected $table = 'Meal_Steps';

    public $timestamps = false;

    protected $fillable = [
        'meal_id',
        'step_number',
        'step_description',
    ];

    public function meal()
    {
        return $this->belongsTo(Meal::class, 'meal_id', 'meal_id');
    }
}

