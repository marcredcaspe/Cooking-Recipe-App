<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Alias for UserFavorite model to match the requested structure.
 * This model uses the same table as UserFavorite.
 */
class FavoriteRecipe extends Model
{
    use HasFactory;

    protected $table = 'User_Favorites';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'meal_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function meal()
    {
        return $this->belongsTo(Meal::class, 'meal_id', 'meal_id');
    }
}

