package com.evtx.user;

import com.evtx.security.SecurityUser;
import com.evtx.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // TODO: fetch user by email and wrap in SecurityUser; throw UsernameNotFoundException if absent
        throw new UnsupportedOperationException("TODO");
    }

    public User getById(UUID id) {
        // TODO: fetch user by id or throw ResourceNotFoundException
        throw new UnsupportedOperationException("TODO");
    }
}
