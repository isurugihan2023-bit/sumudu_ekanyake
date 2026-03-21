// Initialize Lenis for super smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

document.addEventListener('DOMContentLoaded', () => {

    // Smooth anchor scrolling via Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, { offset: -80 }); // offset for navbar
            }
        });
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('bx-menu');
                icon.classList.add('bx-x');
            } else {
                icon.classList.remove('bx-x');
                icon.classList.add('bx-menu');
            }
        });
    }

    // Close mobile menu when a link is clicked
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('bx-x');
            icon.classList.add('bx-menu');
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Reveal elements on scroll (Optimized with IntersectionObserver)
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only reveal once for better performance
            }
        });
    }, {
        rootMargin: '0px 0px -100px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Active Navigation Link on Scroll (Optimized with IntersectionObserver)
    const sections = document.querySelectorAll('section');
    
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-40% 0px -60% 0px' // Triggers when section is near top half of screen
    });

    sections.forEach(section => navObserver.observe(section));

    // Portfolio Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 400); // Wait for transition
                }
            });
        });
    });

    // Modal Logic
    const signinModal = document.getElementById('signin-modal');
    const signupModal = document.getElementById('signup-modal');
    const profileModal = document.getElementById('profile-modal');
    const openSigninBtn = document.getElementById('open-signin');
    const openProfileBtn = document.getElementById('open-profile');
    
    const closeBtns = document.querySelectorAll('.close-modal');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToSignin = document.getElementById('switch-to-signin');

    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) modalContent.classList.add('active'); 
        }, 10);
    };

    const closeModal = (modal) => {
        if (!modal) return;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.classList.remove('active');
        setTimeout(() => {
            modal.classList.remove('show');
            // Only restore scrolling if no other modal is open
            if (!document.querySelector('.modal.show')) {
                document.body.style.overflow = ''; 
            }
        }, 400); 
    };

    // Open Sign In
    if (openSigninBtn) {
        openSigninBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(signinModal);
        });
    }

    // Open Profile
    if (openProfileBtn) {
        openProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Populate profile modal with current user data
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                document.getElementById('profile-name').value = currentUser.name;
                document.getElementById('profile-email').value = currentUser.email;
                document.getElementById('profile-password').value = '';
                
                const preview = document.getElementById('profile-photo-preview');
                const initial = currentUser.name.charAt(0).toUpperCase();
                if (currentUser.photo) {
                    preview.innerHTML = `<img src="${currentUser.photo}" alt="Profile">`;
                } else {
                    preview.innerHTML = initial;
                }
            }
            openModal(profileModal);
        });
    }

    // Close buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    // Close on clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Switch between modals
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(signinModal);
            setTimeout(() => openModal(signupModal), 400);
        });
    }

    if (switchToSignin) {
        switchToSignin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(signupModal);
            setTimeout(() => openModal(signinModal), 400);
        });
    }

    // Authentication Logic (Mocked with LocalStorage)
    const navSigninItem = document.getElementById('nav-signin-item');
    const navUserItem = document.getElementById('nav-user-item');
    const navUserName = document.getElementById('nav-user-name');
    const signoutBtn = document.getElementById('signout-btn');

    const updateAuthUI = () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            if (navSigninItem) navSigninItem.style.display = 'none';
            if (navUserItem) {
                navUserItem.style.display = 'flex';
                const firstName = currentUser.name.split(' ')[0];
                const initial = firstName.charAt(0).toUpperCase();
                const avatarHtml = currentUser.photo 
                    ? `<img src="${currentUser.photo}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`
                    : initial;
                navUserName.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px; transition: 0.2s;">
                        <div style="width: 38px; height: 38px; border-radius: 50%; background-color: var(--light-silver); color: var(--primary-dark); display: flex; justify-content: center; align-items: center; font-weight: bold; font-family: var(--font-secondary); font-size: 1.2rem; overflow: hidden; border: 2px solid var(--white);">
                            ${avatarHtml}
                        </div>
                        <span>${firstName}</span>
                    </div>
                `;
            }
        } else {
            if (navSigninItem) navSigninItem.style.display = 'block';
            if (navUserItem) navUserItem.style.display = 'none';
        }
    };

    updateAuthUI(); // Initial check

    if (signoutBtn) {
        signoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            updateAuthUI(); // Update UI without refreshing
        });
    }

    // Form submissions
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const name = document.getElementById('signup-name').value;
            
            const btn = signupForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Creating account...';
            
            // Save to localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.find(u => u.email === email)) {
                btn.textContent = 'Email already exists!';
                setTimeout(() => btn.textContent = originalText, 2000);
                return;
            }
            
            const newUser = { name, email, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            setTimeout(() => {
                btn.textContent = 'Account Created!';
                setTimeout(() => {
                    closeModal(signupModal);
                    updateAuthUI();
                    setTimeout(() => {
                        btn.textContent = originalText;
                        signupForm.reset();
                    }, 400);
                }, 1000);
            }, 1000);
        });
    }

    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const btn = signinForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Signing in...';
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            setTimeout(() => {
                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    btn.textContent = 'Success!';
                    setTimeout(() => {
                        closeModal(signinModal);
                        updateAuthUI();
                        setTimeout(() => {
                            btn.textContent = originalText;
                            signinForm.reset();
                        }, 400);
                    }, 1000);
                } else {
                    btn.textContent = 'Invalid credentials!';
                    btn.style.backgroundColor = '#ff4d4d'; // Red feedback
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                    }, 2000);
                }
            }, 1000);
        });
    }

    // Profile photo upload handling
    const profileUpload = document.getElementById('profile-upload');
    let uploadedPhotoBase64 = null;

    if (profileUpload) {
        profileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedPhotoBase64 = e.target.result;
                    document.getElementById('profile-photo-preview').innerHTML = `<img src="${uploadedPhotoBase64}" alt="Profile">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Profile form submit
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = profileForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Saving...';

            setTimeout(() => {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser) {
                    const newName = document.getElementById('profile-name').value;
                    const newPassword = document.getElementById('profile-password').value;
                    
                    currentUser.name = newName;
                    if (newPassword) currentUser.password = newPassword;
                    if (uploadedPhotoBase64) currentUser.photo = uploadedPhotoBase64;
                    
                    // Update in list
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const index = users.findIndex(u => u.email === currentUser.email);
                    if (index !== -1) users[index] = currentUser;
                    
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    updateAuthUI();
                }

                btn.textContent = 'Saved!';
                setTimeout(() => {
                    closeModal(profileModal);
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 400);
                }, 1000);
            }, 1000);
        });
    }

    // Lightbox Logic
    const galleryItemsArray = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentImageIndex = 0;
    let visibleGalleryItems = [];

    const updateLightboxImage = (index) => {
        if (visibleGalleryItems.length === 0) return;
        currentImageIndex = index;
        const img = visibleGalleryItems[currentImageIndex].querySelector('img');
        if (img) lightboxImg.src = img.src;
    };

    if (galleryItemsArray.length > 0 && lightbox) {
        galleryItemsArray.forEach((item) => {
            const img = item.querySelector('img');
            item.addEventListener('click', () => {
                visibleGalleryItems = galleryItemsArray.filter(el => el.style.display !== 'none');
                currentImageIndex = visibleGalleryItems.indexOf(item);
                if (currentImageIndex === -1) currentImageIndex = 0;
                
                lightbox.style.display = 'flex';
                setTimeout(() => lightbox.classList.add('show'), 10);
                if (img) lightboxImg.src = img.src;
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('show');
            setTimeout(() => {
                lightbox.style.display = 'none';
                if (!document.querySelector('.modal.show')) {
                    document.body.style.overflow = '';
                }
            }, 300);
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                let newIndex = currentImageIndex - 1;
                if (newIndex < 0) newIndex = visibleGalleryItems.length - 1;
                updateLightboxImage(newIndex);
            });
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', (e) => {
                e.stopPropagation();
                let newIndex = currentImageIndex + 1;
                if (newIndex >= visibleGalleryItems.length) newIndex = 0;
                updateLightboxImage(newIndex);
            });
        }
        
        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg && !e.target.closest('.lightbox-prev') && !e.target.closest('.lightbox-next')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('show')) {
                if (e.key === 'ArrowLeft') {
                    let newIndex = currentImageIndex - 1;
                    if (newIndex < 0) newIndex = visibleGalleryItems.length - 1;
                    updateLightboxImage(newIndex);
                } else if (e.key === 'ArrowRight') {
                    let newIndex = currentImageIndex + 1;
                    if (newIndex >= visibleGalleryItems.length) newIndex = 0;
                    updateLightboxImage(newIndex);
                } else if (e.key === 'Escape') {
                    closeLightbox();
                }
            }
        });
    }

    // Service Cards Modal Logic
    const serviceCards = document.querySelectorAll('.service-card');
    const serviceModal = document.getElementById('service-modal');
    const serviceModalBody = document.getElementById('service-modal-body');

    if (serviceCards.length > 0 && serviceModal) {
        serviceCards.forEach(card => {
            card.addEventListener('click', () => {
                const contentHtml = card.querySelector('.service-content').innerHTML;
                serviceModalBody.innerHTML = contentHtml;

                // Adjust styling for modal presentation
                const ul = serviceModalBody.querySelector('ul');
                if (ul) {
                    ul.style.display = 'inline-block';
                    ul.style.textAlign = 'left';
                    ul.style.marginTop = '20px';
                }
                const h3 = serviceModalBody.querySelector('h3');
                if (h3) {
                    h3.style.color = 'var(--white)';
                    h3.style.fontSize = '2.2rem';
                    h3.style.marginBottom = '20px';
                    h3.style.transform = 'none';
                }
                const items = serviceModalBody.querySelectorAll('li');
                items.forEach(item => {
                    item.style.opacity = '1';
                    item.style.fontSize = '1.1rem';
                    item.style.marginBottom = '15px';
                    item.style.color = '#e0e0e0';
                });

                if (typeof openModal === 'function') {
                    openModal(serviceModal);
                }
            });
        });
    }

    // Custom Cursor
    const cursorDot = document.querySelector('[data-cursor-dot]');

    if (cursorDot) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
        });

        // Hover effect for standard links and buttons
        const interactables = document.querySelectorAll('a, button, .service-card, .menu-toggle, input, textarea, .lightbox-prev, .lightbox-next, .lightbox-close');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovering');
            });
        });

        // "View" text mode for gallery items
        const galleryItems = document.querySelectorAll('.gallery-item');
        const cursorText = cursorDot.querySelector('.cursor-text');
        galleryItems.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('view-mode');
                cursorText.textContent = 'VIEW';
            });
            el.addEventListener('mouseleave', () => {

                cursorDot.classList.remove('view-mode');
                cursorText.textContent = '';
            });
        });
    }

    // SplitText Animation Logic matching the React specs
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof SplitType !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        const splitTextElements = document.querySelectorAll('.split-text-anim');
        splitTextElements.forEach(el => {
            // Split text down to characters
            const split = new SplitType(el, { types: 'chars, words, lines' });
            
            // Replicate the 'from' and 'to' animation frames
            gsap.fromTo(split.chars, 
                { opacity: 0, y: 40 },
                {
                    opacity: 1, 
                    y: 0,
                    duration: 1.25,
                    ease: 'power3.out',
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 90%', // Threshold 0.1
                        once: true
                    }
                }
            );
        });
    }
});
