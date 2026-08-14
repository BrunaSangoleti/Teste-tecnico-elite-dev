package com.evtx.reservation;

import com.evtx.event.Seat;
import com.evtx.event.SeatRepository;
import com.evtx.event.SeatStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Ponto crítico do desafio: "garantir que o mesmo lugar não seja vendido duas vezes".
 * Este teste dispara N threads tentando reservar o MESMO assento ao mesmo tempo e
 * garante que só uma delas consegue - validando o update condicional de SeatRepository.
 *
 * TODO: complementar com um teste equivalente para EventRepository.tryReserveQuantity
 * (modo pista) e para TicketRepository.tryMarkAsUsed (dupla validação na portaria).
 */
@SpringBootTest
@ActiveProfiles("test")
class SeatConcurrencyTest {

    @Autowired
    private SeatRepository seatRepository;

    @Test
    void apenasUmaThreadDeveConseguirReservarOMesmoAssento() throws InterruptedException {
        // Assume que existe infraestrutura mínima de Event/Seat criada via helper/fixture.
        // Simplificado aqui para focar na trava de concorrência do repository.
        Seat seat = criarAssentoDisponivelDeTeste();

        int threads = 10;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch startGate = new CountDownLatch(1);
        AtomicInteger sucessos = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                try {
                    startGate.await();
                    int updated = seatRepository.tryReserveSeat(seat.getId());
                    if (updated > 0) {
                        sucessos.incrementAndGet();
                    }
                } catch (InterruptedException ignored) {
                } 
            });
        }

        startGate.countDown();
        pool.shutdown();
        pool.awaitTermination(5, java.util.concurrent.TimeUnit.SECONDS);

        assertThat(sucessos.get()).isEqualTo(1);

        Seat reloaded = seatRepository.findById(seat.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(SeatStatus.RESERVED);
    }

    private Seat criarAssentoDisponivelDeTeste() {
        // TODO: substituir por um builder/fixture real de Event uma vez que
        // EventService/EventRepository de teste estejam com um evento de apoio criado.
        // Deixado como esqueleto porque depende do restante do setup de fixtures do projeto.
        throw new UnsupportedOperationException(
                "Implementar fixture de Event + Seat antes de rodar este teste (dia 6 do plano)");
    }
}
