import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    changePassword,
    deleteAccount,
    exportExpenses
} from "../api/users"
import type { UserResponse } from "../types"
import Navbar from "../components/Navbar"

const Profile = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [profile, setProfile] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [showDeleteAccount, setShowDeleteAccount] = useState(false)
    const [uploadingPicture, setUploadingPicture] = useState(false)

    const [profileForm, setProfileForm] = useState({
        full_name: "",
        phone_number: "",
        date_of_birth: ""
    })

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    })

    const [deletePassword, setDeletePassword] = useState("")

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const data = await getProfile()
            setProfile(data)
            setProfileForm({
                full_name: data.full_name || "",
                phone_number: data.phone_number || "",
                date_of_birth: data.date_of_birth
                    ? new Date(data.date_of_birth).toISOString().split("T")[0]
                    : ""
            })
        } catch (err: any) {
            setError("Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
    }

    const handleUpdateProfile = async () => {
        try {
            const updated = await updateProfile({
                full_name: profileForm.full_name || undefined,
                phone_number: profileForm.phone_number || undefined,
                date_of_birth: profileForm.date_of_birth || undefined
            })
            setProfile(updated)
            setSuccess("Profile updated successfully!")
            setError("")
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to update profile")
        }
    }

    const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingPicture(true)
        try {
            const updated = await uploadProfilePicture(file)
            setProfile(updated)
            setSuccess("Profile picture updated!")
            setError("")
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to upload picture")
        } finally {
            setUploadingPicture(false)
        }
    }

    const handleChangePassword = async () => {
        if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
            setError("Please fill in all fields")
            return
        }
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setError("New passwords do not match")
            return
        }
        if (passwordForm.new_password.length < 6) {
            setError("New password must be at least 6 characters")
            return
        }
        try {
            await changePassword(passwordForm.current_password, passwordForm.new_password)
            setSuccess("Password changed successfully!")
            setError("")
            setPasswordForm({ current_password: "", new_password: "", confirm_password: "" })
            setShowChangePassword(false)
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to change password")
        }
    }

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setError("Please enter your password")
            return
        }
        try {
            await deleteAccount(deletePassword)
            logout()
            navigate("/login")
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to delete account")
        }
    }

    const handleExport = async () => {
        try {
            await exportExpenses()
            setSuccess("Expenses exported successfully!")
        } catch (err: any) {
            setError("Failed to export expenses")
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Loading...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

                <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Profile Picture */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Profile Picture</h2>
                    <div className="flex items-center gap-6">
                        <div
                            className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold cursor-pointer overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {profile?.profile_picture ? (
                                <img
                                    src={profile.profile_picture}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                profile?.email?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPicture}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
                            >
                                {uploadingPicture ? "Uploading..." : "Upload Picture"}
                            </button>
                            <p className="text-xs text-gray-400 mt-1">JPEG, PNG or WebP — max 2MB</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePictureUpload}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Account Info</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={profile?.email || ""}
                            disabled
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={profileForm.full_name}
                            onChange={handleProfileChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={profileForm.phone_number}
                            onChange={handleProfileChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+1234567890"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={profileForm.date_of_birth}
                            onChange={handleProfileChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                        <input
                            type="text"
                            value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ""}
                            disabled
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                        />
                    </div>

                    <button
                        onClick={handleUpdateProfile}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Save Changes
                    </button>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-700">Change Password</h2>
                        <button
                            onClick={() => setShowChangePassword(!showChangePassword)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {showChangePassword ? "Cancel" : "Change"}
                        </button>
                    </div>

                    {showChangePassword && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    name="current_password"
                                    value={passwordForm.current_password}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={passwordForm.new_password}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={passwordForm.confirm_password}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                onClick={handleChangePassword}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Update Password
                            </button>
                        </div>
                    )}
                </div>

                {/* Export Expenses */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Export Data</h2>
                    <p className="text-sm text-gray-500 mb-4">Download all your expenses as a CSV file.</p>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Export Expenses as CSV
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border border-red-100">
                    <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
                    <p className="text-sm text-gray-500">
                        Once you delete your account all your data will be permanently removed.
                    </p>
                    <button
                        onClick={() => setShowDeleteAccount(!showDeleteAccount)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Delete Account
                    </button>

                    {showDeleteAccount && (
                        <div className="space-y-3 mt-3">
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter your password to confirm"
                            />
                            <button
                                onClick={handleDeleteAccount}
                                className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition"
                            >
                                Confirm Delete Account
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Profile