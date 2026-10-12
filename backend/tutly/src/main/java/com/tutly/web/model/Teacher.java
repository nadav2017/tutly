package com.tutly.web.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String phone;

    private String city;

    private String description;

    private String imageUrl;

   @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
   private List<Subject> subjects;


    @Enumerated(EnumType.STRING)
    private Role role;



}