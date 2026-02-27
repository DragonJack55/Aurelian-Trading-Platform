import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import { submitVerification, getVerificationStatus } from '../services/verificationService';
import { useApp } from '../context/AppContext';

const VerifyModal = ({ isOpen, onClose, userEmail }) => {
    const { user: contextUser, loading } = useApp();
    const [formData, setFormData] = useState({
        fullName: '',
        idNumber: ''
    });
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [verificationStatus, setVerificationStatus] = useState(null);

    const loadVerificationStatus = React.useCallback(async () => {
        let effectiveEmail = userEmail;
        if (!effectiveEmail) {
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            effectiveEmail = storedUser?.email;
        }

        if (effectiveEmail) {
            const result = await getVerificationStatus(effectiveEmail);
            if (result.success) {
                setVerificationStatus(result);
            }
        }
    }, [userEmail]);

    useEffect(() => {
        console.log('[VerifyModal] Modal opened:', isOpen, 'UserEmail:', userEmail);
        if (isOpen) {
            loadVerificationStatus();
        }
    }, [isOpen, userEmail, loadVerificationStatus]);

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'front') {
                    setFrontImage(file);
                    setFrontPreview(reader.result);
                } else {
                    setBackImage(file);
                    setBackPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    // Compression helper - Returns Base64 String
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600; // More aggressive reduction
                    const MAX_HEIGHT = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Get Base64 string (JPEG, 0.5 quality)
                    const base64String = canvas.toDataURL('image/jpeg', 0.5);
                    resolve(base64String);
                };
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Use contextUser from AppContext - this is the authoritative source
        if (!contextUser || !contextUser.uid) {
            setError('User not authenticated. Please log in and try again.');
            return;
        }

        if (!formData.fullName || !formData.idNumber || !frontImage || !backImage) {
            setError('Please fill in all fields and upload both ID images');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('[VerifyModal] Processing images to Base64...');
            const frontBase64 = await compressImage(frontImage);
            const backBase64 = await compressImage(backImage);

            // Log approximate size (Base64 length is the storage size in Firestore)
            const frontSizeKB = Math.round(frontBase64.length / 1024);
            const backSizeKB = Math.round(backBase64.length / 1024);
            const totalSizeKB = frontSizeKB + backSizeKB;

            console.log('[VerifyModal] Payload sizes (Firestore Storage):',
                { front: frontSizeKB + 'KB', back: backSizeKB + 'KB', total: totalSizeKB + 'KB' }
            );

            // Client-side check for total size
            if (totalSizeKB > 900) {
                setError('Images are still too large despite compression. Please use clearer or smaller photos.');
                setIsSubmitting(false);
                return;
            }

            console.log('[VerifyModal] Calling submitVerification...');
            // Pass user object directly from AppContext
            const result = await submitVerification(contextUser, formData, frontBase64, backBase64);

            if (result.success) {
                console.log('[VerifyModal] Success! Reloading status...');
                await loadVerificationStatus();
                // Reset form
                setFormData({ fullName: '', idNumber: '' });
                setFrontImage(null);
                setBackImage(null);
                setFrontPreview(null);
                setBackPreview(null);
            } else {
                console.error('[VerifyModal] Submission failed:', result.error);
                setError(result.error || 'Failed to submit verification.');
            }
        } catch (err) {
            console.error('[VerifyModal] Exception:', err);
            setError('An unexpected error occurred. Please try again.');
        }

        setIsSubmitting(false);
    };

    const handleResubmit = () => {
        setVerificationStatus({ status: 'unverified', data: null });
        setFormData({ fullName: '', idNumber: '' });
        setFrontImage(null);
        setBackImage(null);
        setFrontPreview(null);
        setBackPreview(null);
    };

    if (!isOpen) return null;

    const status = verificationStatus?.status || 'unverified';
    const data = verificationStatus?.data;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(8px)'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                border: '1px solid var(--glass-border)',
                padding: 0
            }}>
                <X
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        cursor: 'pointer',
                        color: 'var(--primary-gold)',
                        zIndex: 10
                    }}
                    size={24}
                />

                <div style={{ padding: '40px' }}>
                    <h2 className="gold-text" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px', textAlign: 'center', letterSpacing: '1px' }}>
                        IDENTITY VERIFICATION
                    </h2>

                    {/* Status Display */}
                    {status === 'pending' && (
                        <div style={{
                            background: 'rgba(212, 175, 55, 0.05)',
                            border: '1px solid var(--primary-gold)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <Clock size={32} color="var(--primary-gold)" />
                            <div>
                                <div style={{ fontWeight: '800', color: 'var(--primary-gold)', fontSize: '16px', marginBottom: '4px' }}>UNDER REVIEW</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                    Your verification is being reviewed by our team. This usually takes 1-2 business days.
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'verified' && (
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.05)',
                            border: '1px solid var(--success-green)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <CheckCircle size={32} color="var(--success-green)" />
                            <div>
                                <div style={{ fontWeight: '800', color: 'var(--success-green)', fontSize: '16px', marginBottom: '4px' }}>VERIFIED</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                    Your identity has been verified successfully!
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'rejected' && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid var(--danger-red)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '32px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                <XCircle size={32} color="var(--danger-red)" />
                                <div style={{ fontWeight: '800', color: 'var(--danger-red)', fontSize: '16px' }}>VERIFICATION REJECTED</div>
                            </div>
                            {data?.rejectionReason && (
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                                    Reason: {data.rejectionReason}
                                </div>
                            )}
                            <button
                                onClick={handleResubmit}
                                className="gold-button"
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    fontWeight: '800',
                                    width: 'auto'
                                }}
                            >
                                RESUBMIT VERIFICATION
                            </button>
                        </div>
                    )}

                    {/* Form - show only if unverified or resubmitting */}
                    {(status === 'unverified' || status === 'rejected') && !verificationStatus?.data && (
                        <form onSubmit={handleSubmit}>
                            {/* Name */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Enter your real name"
                                    style={{
                                        width: '100%',
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'var(--text-primary)',
                                        fontSize: '15px'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-gold)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                                    required
                                />
                            </div>

                            {/* ID Number */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    ID Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                    placeholder="Enter your document number"
                                    style={{
                                        width: '100%',
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'var(--text-primary)',
                                        fontSize: '15px'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-gold)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                                    required
                                />
                            </div>

                            {/* Upload ID photo */}
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Upload Identification Documents
                                </label>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {/* Front of ID */}
                                    <div
                                        onClick={() => document.getElementById('frontUpload').click()}
                                        style={{
                                            border: '1px dashed var(--glass-border)',
                                            borderRadius: '16px',
                                            padding: frontPreview ? '10px' : '30px 10px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            background: 'rgba(255,255,255,0.02)',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minHeight: '140px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-gold)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                    >
                                        {frontPreview ? (
                                            <img src={frontPreview} alt="Front ID" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                                        ) : (
                                            <>
                                                <Upload size={24} color="var(--primary-gold)" style={{ marginBottom: '8px', opacity: 0.7 }} />
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>FRONT SIDE</div>
                                            </>
                                        )}
                                        <input
                                            id="frontUpload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'front')}
                                            style={{ display: 'none' }}
                                        />
                                    </div>

                                    {/* Back of ID */}
                                    <div
                                        onClick={() => document.getElementById('backUpload').click()}
                                        style={{
                                            border: '1px dashed var(--glass-border)',
                                            borderRadius: '16px',
                                            padding: backPreview ? '10px' : '30px 10px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            background: 'rgba(255,255,255,0.02)',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minHeight: '140px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-gold)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                    >
                                        {backPreview ? (
                                            <img src={backPreview} alt="Back ID" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                                        ) : (
                                            <>
                                                <Upload size={24} color="var(--primary-gold)" style={{ marginBottom: '8px', opacity: 0.7 }} />
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>BACK SIDE</div>
                                            </>
                                        )}
                                        <input
                                            id="backUpload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'back')}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    padding: '16px',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    color: 'var(--danger-red)',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    fontSize: '13px',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="gold-button"
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    fontSize: '16px',
                                    fontWeight: '800',
                                    letterSpacing: '1px'
                                }}
                            >
                                {isSubmitting ? 'PROCESSING...' : 'CONFIRM SUBMISSION'}
                            </button>
                        </form>
                    )}

                    {/* Already submitted - show submitted info */}
                    {status === 'pending' && data && (
                        <div style={{
                            marginTop: '40px',
                            padding: '24px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '16px',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '800', color: 'var(--primary-gold)', textTransform: 'uppercase', fontSize: '11px' }}>Full Name</span>
                                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{data.fullName}</span>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '800', color: 'var(--primary-gold)', textTransform: 'uppercase', fontSize: '11px' }}>ID Number</span>
                                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{data.idNumber}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.6, borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '16px' }}>
                                Submitted on {data.submittedAt ? new Date(data.submittedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyModal;
