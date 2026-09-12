<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Partner;

class UpdatePartnerUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'partners:update-urls {--force : Force update even if URLs seem correct}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update partner logo URLs to use current APP_URL configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating partner logo URLs to use current APP_URL...');

        $currentAppUrl = config('app.url');
        $this->line("Current APP_URL: {$currentAppUrl}");

        $partners = Partner::whereNotNull('logo')->get();

        if ($partners->isEmpty()) {
            $this->info('No partners with logos found.');
            return 0;
        }

        $count = 0;
        foreach ($partners as $partner) {
            $oldLogo = $partner->logo;
            $updated = false;

            // Extract the storage path from various URL formats
            if (preg_match('/\/storage\/(.+)$/', $partner->logo, $matches)) {
                $storagePath = $matches[1];
                $newLogo = $currentAppUrl . '/storage/' . $storagePath;

                if ($oldLogo !== $newLogo || $this->option('force')) {
                    $partner->logo = $newLogo;
                    $partner->save();
                    $updated = true;
                    $count++;
                }
            }

            if ($updated) {
                $this->line("✅ Updated {$partner->name}:");
                $this->line("   From: {$oldLogo}");
                $this->line("   To:   {$partner->logo}");
            } else {
                $this->line("⏭️  Skipped {$partner->name} (already correct)");
            }
        }

        $this->info("Updated {$count} partner logo URLs.");

        if ($count > 0) {
            $this->info('✨ Partner URLs have been updated to use the current APP_URL configuration.');
        }

        return 0;
    }
}
