import React, { useState, useEffect } from 'react';
import { Coffee, UserCircle, Building2, ArrowLeft, Calendar, UserPlus } from 'lucide-react';
import { supabase, testConnection } from '../lib/supabase';
import { sendChatworkNotification } from '../lib/chatwork';
import { toast } from 'react-hot-toast';
import type { Company, StaffMember } from '../types/database';

type VisitorInfo = {
  name: string;
  company: string;
};

type AppointmentType = 'appointment' | 'walkin' | null;

function VisitorApp() {
  const [step, setStep] = useState<'home' | 'appointment' | 'form' | 'company' | 'staff' | 'complete'>('home');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>(null);
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo>({ name: '', company: '' });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [countdown, setCountdown] = useState(5);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const isConnected = await testConnection();
      if (!isConnected) {
        toast.error('データベース接続に失敗しました');
        return;
      }
      await fetchCompanies();
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchStaffMembers(selectedCompany);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (step === 'complete') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep('home');
            setVisitorInfo({ name: '', company: '' });
            setSelectedCompany('');
            setSelectedStaff('');
            setAppointmentType(null);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const fetchCompanies = async () => {
    setIsCompanyLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching companies:', error);
        await supabase.from('error_logs').insert([{
          error_message: 'Failed to fetch companies',
          error_stack: error.message
        }]);
        toast.error('会社情報の取得に失敗しました');
        return;
      }

      setCompanies(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      await supabase.from('error_logs').insert([{
        error_message: 'Unexpected error while fetching companies',
        error_stack: error instanceof Error ? error.stack : String(error)
      }]);
      toast.error('予期せぬエラーが発生しました');
    } finally {
      setIsCompanyLoading(false);
    }
  };

  const fetchStaffMembers = async (companyId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      
      if (error) {
        console.error('Error fetching staff members:', error);
        await supabase.from('error_logs').insert([{
          error_message: 'Failed to fetch staff members',
          error_stack: error.message
        }]);
        toast.error('担当者情報の取得に失敗しました');
        return;
      }

      setStaffMembers(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      await supabase.from('error_logs').insert([{
        error_message: 'Unexpected error while fetching staff members',
        error_stack: error instanceof Error ? error.stack : String(error)
      }]);
      toast.error('予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffSelect = async (staffId: string) => {
    setIsLoading(true);
    try {
      await sendChatworkNotification(
        visitorInfo.name,
        visitorInfo.company || null,
        staffId,
        true
      );
      setSelectedStaff(staffId);
      setStep('complete');
    } catch (error) {
      console.error('Notification error:', error);
      toast.error(error instanceof Error ? error.message : 'Chatworkへの通知に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalkinNotification = async () => {
    setIsLoading(true);
    try {
      await sendChatworkNotification(
        visitorInfo.name,
        visitorInfo.company || null,
        null,
        false
      );
      setStep('complete');
    } catch (error) {
      console.error('Notification error:', error);
      toast.error(error instanceof Error ? error.message : 'Chatworkへの通知に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHome = () => (
    <div className="relative text-center animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-3xl opacity-90 -z-10" />
      <div className="relative z-10 py-8 sm:py-16 px-4 sm:px-8 backdrop-blur-sm rounded-3xl glass-effect">
        <div className="mb-12">
          <img
            src="/logo.png"
            alt="Company Logo"
            className="w-48 sm:w-64 mx-auto"
          />
        </div>
        <div>
          <h1 className="text-4xl sm:text-7xl font-black mb-8 sm:mb-12 text-gray-900 transform transition-all duration-700 hover:scale-110 animate-float bg-clip-text">
            ようこそ！
          </h1>
          <button
            onClick={() => setStep('appointment')}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className={`
              relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold 
              py-6 sm:py-8 px-12 sm:px-20 rounded-2xl text-2xl sm:text-3xl
              transition-all duration-500 transform hover-lift ripple
              ${isButtonHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'}
            `}
          >
            <span className={`transition-transform duration-300 inline-block
              ${isButtonHovered ? 'scale-105' : ''}`}>
              受付開始
            </span>
            {isButtonHovered && (
              <div className="absolute inset-0 bg-white/20 rounded-2xl -z-10 animate-pulse-slow" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppointmentSelection = () => (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      {renderBackButton(() => setStep('home'))}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl glass-effect">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-gray-800 text-center">ご予約の確認</h2>
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          <button
            onClick={() => {
              setAppointmentType('appointment');
              setStep('form');
            }}
            className="w-full p-6 sm:p-8 text-center border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50/50
              transition-all duration-500 transform hover-lift ripple
              flex flex-col items-center group animate-scale-in"
          >
            <Calendar className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mb-4" />
            <span className="text-2xl sm:text-3xl font-medium group-hover:text-blue-700 transition-colors duration-300">
              ご予約のあるお客様
            </span>
          </button>
          <button
            onClick={() => {
              setAppointmentType('walkin');
              setStep('form');
            }}
            className="w-full p-6 sm:p-8 text-center border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50/50
              transition-all duration-500 transform hover-lift ripple
              flex flex-col items-center group animate-scale-in"
          >
            <UserPlus className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mb-4" />
            <span className="text-2xl sm:text-3xl font-medium group-hover:text-blue-700 transition-colors duration-300">
              ご予約のないお客様
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderBackButton = (onBack: () => void) => (
    <button
      onClick={onBack}
      className="mb-4 sm:mb-6 flex items-center text-gray-600 hover:text-gray-800 text-lg sm:text-xl transition-all duration-300 
        hover-lift group ripple px-3 sm:px-4 py-2 rounded-lg"
    >
      <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2 transition-transform duration-300 group-hover:-translate-x-2" />
      戻る
    </button>
  );

  const renderForm = () => (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      {renderBackButton(() => setStep('appointment'))}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl glass-effect">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-gray-800">来訪者情報</h2>
        <div className="space-y-6 sm:space-y-8">
          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <label className="block text-gray-700 text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={visitorInfo.name}
              onChange={(e) => setVisitorInfo({ ...visitorInfo, name: e.target.value })}
              className="w-full p-4 sm:p-5 text-lg sm:text-xl border-2 rounded-xl input-focus-ring
                transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
              placeholder="山田 太郎"
              required
            />
          </div>
          <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <label className="block text-gray-700 text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              会社名 <span className="text-gray-400">(任意)</span>
            </label>
            <input
              type="text"
              value={visitorInfo.company}
              onChange={(e) => setVisitorInfo({ ...visitorInfo, company: e.target.value })}
              className="w-full p-4 sm:p-5 text-lg sm:text-xl border-2 rounded-xl input-focus-ring
                transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
              placeholder="株式会社D"
            />
          </div>
          <button
            onClick={() => {
              if (visitorInfo.name) {
                if (appointmentType === 'appointment') {
                  setStep('company');
                } else {
                  handleWalkinNotification();
                }
              }
            }}
            disabled={!visitorInfo.name}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 sm:py-5 px-6 sm:px-8 
              rounded-xl text-xl sm:text-2xl font-bold hover:from-blue-600 hover:to-blue-700 
              disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
              transition-all duration-500 transform hover-lift ripple animate-scale-in"
            style={{ animationDelay: '0.3s' }}
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompanySelection = () => (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      {renderBackButton(() => setStep('form'))}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl glass-effect">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-gray-800">アポイント先選択</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {isCompanyLoading ? (
            <div className="text-center text-gray-500 py-6 sm:py-8 text-lg sm:text-xl">
              読み込み中...
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center text-gray-500 py-6 sm:py-8 text-lg sm:text-xl">
              会社情報が登録されていません
            </div>
          ) : (
            companies.map((company, index) => (
              <button
                key={company.id}
                onClick={() => {
                  setSelectedCompany(company.id);
                  setStep('staff');
                }}
                className="w-full p-4 sm:p-6 text-left border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50/50
                  transition-all duration-500 transform hover-lift ripple
                  flex items-center group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-gray-100 rounded-full p-2 sm:p-3 group-hover:bg-blue-100 transition-colors duration-300">
                  <Building2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                <span className="text-xl sm:text-2xl font-medium ml-4 sm:ml-6 group-hover:text-blue-700 transition-colors duration-300">
                  {company.name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderStaffSelection = () => (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      {renderBackButton(() => setStep('company'))}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl glass-effect">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-gray-800">担当者選択</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {isLoading ? (
            <div className="text-center text-gray-500 py-6 sm:py-8 text-lg sm:text-xl">
              読み込み中...
            </div>
          ) : staffMembers.length === 0 ? (
            <div className="text-center text-gray-500 py-6 sm:py-8 text-lg sm:text-xl">
              担当者が登録されていません
            </div>
          ) : (
            staffMembers.map((staff, index) => (
              <button
                key={staff.id}
                onClick={() => handleStaffSelect(staff.id)}
                disabled={isLoading}
                className="w-full p-4 sm:p-6 text-left border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50/50
                  transition-all duration-500 transform hover-lift ripple
                  flex items-center group animate-scale-in disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-gray-100 rounded-full p-2 sm:p-3 group-hover:bg-blue-100 transition-colors duration-300">
                  {staff.photo_url ? (
                    <img
                      src={staff.photo_url}
                      alt={staff.name}
                      className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                  )}
                </div>
                <div className="ml-4 sm:ml-6">
                  <div className="text-xl sm:text-2xl font-medium group-hover:text-blue-700 transition-colors duration-300">
                    {staff.name}
                  </div>
                  {staff.department && (
                    <div className="text-sm sm:text-base text-gray-500 group-hover:text-blue-600 transition-colors duration-300">
                      {staff.department}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl text-center glass-effect">
        <div className="mb-8">
          <Coffee className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-green-500 animate-float" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
          受付完了
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          担当者に通知しました。しばらくお待ちください。
        </p>
        <p className="text-gray-500">
          {countdown}秒後にホーム画面に戻ります
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      {step === 'home' && renderHome()}
      {step === 'appointment' && renderAppointmentSelection()}
      {step === 'form' && renderForm()}
      {step === 'company' && renderCompanySelection()}
      {step === 'staff' && renderStaffSelection()}
      {step === 'complete' && renderComplete()}
    </div>
  );
}

export default VisitorApp;