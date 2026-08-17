package com.evtx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EvtxApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvtxApplication.class, args);
    }
}
