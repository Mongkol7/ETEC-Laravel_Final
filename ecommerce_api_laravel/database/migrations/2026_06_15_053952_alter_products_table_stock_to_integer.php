<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE products ALTER COLUMN stock TYPE INTEGER USING stock::INTEGER');
        DB::statement('ALTER TABLE products ALTER COLUMN stock SET DEFAULT 0');
        DB::statement('ALTER TABLE products ALTER COLUMN stock DROP NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE products ALTER COLUMN stock TYPE VARCHAR(255)');
    }
};
