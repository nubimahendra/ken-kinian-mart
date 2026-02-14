<?php

namespace App\Jobs;

use App\Services\Payment\PaymentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPaymentNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected array $payload
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(PaymentService $paymentService): void
    {
        try {
            Log::info('Queue: Processing Payment Notification', ['order_id' => $this->payload['order_id'] ?? 'unknown']);

            // Delegate back to service for logic
            $paymentService->handleNotification($this->payload);

        } catch (\Exception $e) {
            Log::error('Queue: Payment Notification Failed', [
                'error' => $e->getMessage(),
                'payload' => $this->payload
            ]);

            // Re-throw to ensure job is marked as failed/retried
            throw $e;
        }
    }
}
