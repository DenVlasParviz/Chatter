import React from 'react'
import "../styles/auth.css"

import {SignInButton} from "@clerk/clerk-react";

const AuthPage = () => {
    return (
        <div className="auth-container">
            <div className="auth-left">
                <div className='auth-hero'>
                    <div className='brand-container'>
                        <img src="/Logo.png" alt="Chatter" className="brand-logo"/>
                        <span className='brand-name'>Chatter</span>
                    </div>
                    <h1 className='hero-title'>Місце для роботи</h1>

                    <p className='hero-subtitle'> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi et
                        eum ex modi nobis quas quibusdam veniam veritatis! Accusamus ad assumenda corporis deserunt eius
                        nam nemo, nulla quas quo vel!</p>
                    <div className='features-list'>
                        <div className='feature-item'>
                            <span className='feature-icon'>1</span>
                            <span>Чат в реальному часі</span>
                        </div>
                        <div className='feature-item'>
                            <span className='feature-icon'>2</span>
                            <span>Відеоконференції</span>
                        </div>
                        <div className='feature-item'>
                            <span className='feature-icon'>3</span>
                            <span>Приватні та публічні чати</span>
                        </div>
                    </div>

                    <SignInButton mode='modal'>
                        <button className='cta-button'>
                            Почати
                        </button>
                    </SignInButton>
                </div>
            </div>
            <div className="auth-right">
                <div className='auth-image-container'>
                    <img src="/Logo.png" alt=""/>
                </div>
            </div>
        </div>
    )
}
export default AuthPage
