<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meal extends Model
{
    use HasFactory;

    protected $table = 'Meals';

    protected $primaryKey = 'meal_id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'meal_id',
        'title',
        'thumbnail',
        'source',
        'user_id',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function favorites()
    {
        return $this->hasMany(UserFavorite::class, 'meal_id', 'meal_id');
    }

    public function ingredients()
    {
        return $this->hasMany(MealIngredient::class, 'meal_id', 'meal_id');
    }

    public function steps()
    {
        return $this->hasMany(MealStep::class, 'meal_id', 'meal_id')->orderBy('step_number');
    }
}

